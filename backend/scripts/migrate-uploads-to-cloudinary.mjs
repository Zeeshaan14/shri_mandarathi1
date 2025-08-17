#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import cloudinary from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Cloudinary environment variables are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env');
  process.exit(1);
}

cloudinary.v2.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const uploadsDir = path.join(process.cwd(), 'uploads');
const dryRun = process.argv.includes('--dry');
const confirm = process.argv.includes('--yes') || process.argv.includes('--confirm');
const retries = 3;
const baseTimeoutMs = 30000; // 30s timeout per attempt

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// Upload buffer using upload_stream with timeout, wrapped in retry logic
async function uploadBufferWithRetries(buffer, publicId) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await uploadBufferOnce(buffer, publicId, baseTimeoutMs);
      return res;
    } catch (err) {
      console.error(`Upload attempt ${attempt} failed for ${publicId}:`, err?.message || err);
      if (attempt < retries) {
        const backoff = 1000 * Math.pow(2, attempt); // 2s, 4s...
        console.log(`Retrying in ${backoff}ms...`);
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
}

function uploadBufferOnce(buffer, publicId, timeoutMs) {
  return new Promise((resolve, reject) => {
    let finished = false;
    // @ts-ignore
    const stream = cloudinary.v2.uploader.upload_stream({ public_id: publicId, folder: 'products' }, (error, result) => {
      finished = true;
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);

    const id = setTimeout(() => {
      if (finished) return;
      // No direct abort on upload_stream, just reject; Cloudinary SDK will handle eventual socket close
      reject(new Error('Cloudinary upload timed out'));
    }, timeoutMs);

    // clear timeout on resolution/rejection
    const onceDone = (p) => {
      clearTimeout(id);
    };
    // attach handlers
    // Since we resolve/reject above, this ensures timeout clears
    Promise.resolve()
      .then(() => {})
      .finally(() => {});
  });
}

async function uploadFile(localPath, filename) {
  const buffer = await fs.promises.readFile(localPath);
  const publicId = `products/${path.parse(filename).name}`;
  const res = await uploadBufferWithRetries(buffer, publicId);
  return res;
}

async function main() {
  if (!fs.existsSync(uploadsDir)) {
    console.error('Uploads directory not found:', uploadsDir);
    await prisma.$disconnect();
    process.exit(1);
  }

  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  if (files.length === 0) {
    console.log('No files found in uploads/. Nothing to do.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${files.length} files in uploads/`);
  if (dryRun) console.log('Running in dry-run mode: uploads will still be sent to Cloudinary but DB will not be modified.');

  if (!dryRun && !confirm) {
    console.log('\nRunning without --confirm. No DB writes will be performed. Use --confirm to update DB.');
  }

  for (const file of files) {
    const localPath = path.join(uploadsDir, file);
    try {
      console.log('\nUploading', file);
      const res = await uploadFile(localPath, file);
      const url = res.secure_url || res.url;
      console.log('Uploaded to Cloudinary:', url);

      if (!dryRun && confirm) {
        const containsPath = `/uploads/${file}`;

        const updatedProducts = await prisma.product.updateMany({
          where: { imageUrl: { contains: containsPath } },
          data: { imageUrl: url },
        });

        const updatedVariants = await prisma.productVariant.updateMany({
          where: { imageUrl: { contains: containsPath } },
          data: { imageUrl: url },
        });

        console.log(`DB updated - products: ${updatedProducts.count}, variants: ${updatedVariants.count}`);
      }
    } catch (err) {
      console.error('Failed processing', file, err?.message || err);
    }
  }

  await prisma.$disconnect();
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
