import type { Request, Response } from "express";
import { prisma1 } from "../utils/prisma.js";
import { IMAGEKIT_ENABLED, uploadToImageKit } from "../utils/imagekit.js";
import fs from "fs";
import path from "path";

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId } = req.body as any;
    // variations can arrive as JSON string when multipart/form-data is used
    let variationsRaw: any = (req as any).body?.variations;
    if (typeof variationsRaw === "string") {
      try {
        variationsRaw = JSON.parse(variationsRaw);
      } catch {
        return res.status(400).json({ message: "Invalid variations JSON" });
      }
    }
    const variations: Array<{ size: string; price: number | string; stock: number | string; sku?: string | null }>
      = Array.isArray(variationsRaw) ? variationsRaw : [];
    let imageUrl: string | undefined;

    // Upload main product image if provided
    if (req.file) {
      console.log(`📁 Processing image upload: ${req.file.originalname} (${req.file.size} bytes)`);
      
      try {
        if (IMAGEKIT_ENABLED) {
          console.log('🖼️ Using ImageKit for image upload');
          const result: any = await uploadToImageKit(req.file.buffer, req.file.originalname, "products");
          imageUrl = result.url;
          console.log(`✅ Image uploaded to ImageKit: ${imageUrl}`);
        } else {
          console.log('💾 Using local storage for image upload');
          // Local file path (served from /uploads)
          // @ts-ignore multer adds path when using diskStorage
          const localPath: string | undefined = (req.file as any).path;
          if (!localPath) {
            throw new Error("Local upload path missing");
          }
          const fileName = localPath.split("uploads").pop()?.replace(/^[/\\]/, "");
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          imageUrl = `${baseUrl}/uploads/${fileName}`;
          console.log(`✅ Image saved locally: ${imageUrl}`);
        }
      } catch (e: any) {
        console.error("❌ Primary upload method failed:", e?.message || e);
        
        // Only run fallback if ImageKit was enabled and failed
        if (IMAGEKIT_ENABLED) {
          console.log('🔄 ImageKit failed, attempting local storage fallback...');
          try {
            const uploadDir = path.join(process.cwd(), "uploads");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            
            const ext = path.extname(req.file.originalname) || ".bin";
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            const fullPath = path.join(uploadDir, fileName);
            
            await fs.promises.writeFile(fullPath, req.file.buffer);
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            imageUrl = `${baseUrl}/uploads/${fileName}`;
            
            console.log(`✅ Fallback local upload successful: ${imageUrl}`);
          } catch (diskErr: any) {
            console.error("❌ Local upload fallback also failed:", diskErr?.message || diskErr);
            return res.status(500).json({ 
              message: "Image upload failed - both ImageKit and local storage failed",
              error: diskErr?.message || "Unknown error"
            });
          }
        } else {
          // If local storage was the primary method and it failed, return error
          return res.status(500).json({ 
            message: "Local image upload failed",
            error: e?.message || "Unknown error"
          });
        }
      }
    }

    // Normalize types and validate
    const normalizedVariations = (variations || []).map((v: any) => ({
      size: v.size,
      price: Number(v.price),
      stock: Number(v.stock),
      sku: v.sku || null,
    }));
    if (normalizedVariations.some((v) => !v.size || Number.isNaN(v.price) || Number.isNaN(v.stock))) {
      return res.status(400).json({ message: "Invalid variations data" });
    }

    // Check duplicate SKUs
    const skus = normalizedVariations.map((v) => v.sku).filter(Boolean) as string[];
    const uniqueSkus = new Set(skus);
    if (skus.length !== uniqueSkus.size) {
      return res.status(400).json({ message: "Duplicate SKUs found" });
    }

    // Check existing SKUs in DB
    if (skus.length > 0) {
      const existing = await prisma1.productVariant.findMany({
        where: { sku: { in: skus } },
        select: { sku: true },
      });
      if (existing.length > 0) {
        return res.status(400).json({
          message: `The following SKUs already exist: ${existing.map((e: any) => e.sku).join(", ")}`,
        });
      }
    }

    const category = await prisma1.category.findUnique({ where: { id: categoryId as string } });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Log the final imageUrl that will be saved to database
    console.log(`💾 Saving product to database with imageUrl: ${imageUrl}`);

    const product = await prisma1.product.create({
      data: {
        name: name as string,
        description: description as string,
        category: { connect: { id: categoryId as string } },
        imageUrl: imageUrl ?? null,
        variations: { create: normalizedVariations },
      },
      include: { variations: true },
    });

    res.status(201).json(product);
  } catch (err: any) {
    console.error("[CREATE_PRODUCT_ERROR]", err);
    res.status(500).json({ message: err?.message || "Server error" });
  }
};

// Get All Products
export const getProducts = async (_: Request, res: Response) => {
  try {
    const products = await prisma1.product.findMany({
      include: { category: true, variations: true },
    });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    const product = await prisma1.product.findUnique({
      where: { id: id as string },
      include: { category: true, variations: true },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId, imageUrl, variations } = req.body;
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Product ID is required" });

    let newImageUrl = imageUrl; // Default to existing imageUrl from request body
    
    if (req.file) {
      console.log(`📁 Processing image update: ${req.file.originalname} (${req.file.size} bytes)`);
      
      try {
        if (IMAGEKIT_ENABLED) {
          console.log('🖼️ Using ImageKit for image update');
          const result: any = await uploadToImageKit(req.file.buffer, req.file.originalname, "products");
          newImageUrl = result.url;
          console.log(`✅ Image updated on ImageKit: ${newImageUrl}`);
        } else {
          console.log('💾 Using local storage for image update');
          // Local file path (served from /uploads)
          const uploadDir = path.join(process.cwd(), "uploads");
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          
          const ext = path.extname(req.file.originalname) || ".bin";
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          const fullPath = path.join(uploadDir, fileName);
          
          await fs.promises.writeFile(fullPath, req.file.buffer);
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          newImageUrl = `${baseUrl}/uploads/${fileName}`;
          console.log(`✅ Image updated locally: ${newImageUrl}`);
        }
      } catch (e: any) {
        console.error("❌ Image update failed:", e?.message || e);
        return res.status(500).json({ 
          message: "Image update failed",
          error: e?.message || "Unknown error"
        });
      }
    } else {
      // No new file uploaded, keep existing imageUrl
      console.log(`📷 No new image uploaded, keeping existing imageUrl: ${newImageUrl}`);
    }

    // Log the final newImageUrl that will be saved to database
    console.log(`💾 Updating product in database with newImageUrl: ${newImageUrl}`);

    const existingVariants = await prisma1.productVariant.findMany({ where: { productId: id } });
    const existingVariantIds = existingVariants.map((v: any) => v.id);

    const referencedOrderVariants = await prisma1.orderItem.findMany({
      where: { variantId: { in: existingVariantIds } },
      select: { variantId: true },
    });
    const referencedCartVariants = await prisma1.cartItem.findMany({
      where: { variantId: { in: existingVariantIds } },
      select: { variantId: true },
    });
    const referencedVariantIds = new Set([
      ...referencedOrderVariants.map((v: any) => v.variantId),
      ...referencedCartVariants.map((v: any) => v.variantId),
    ]);

    type Variant = { size: string; price: number; stock: number; sku?: string; imageUrl?: string };
    const incomingBySku: Record<string, Variant> = Object.fromEntries(
      ((variations || []) as Variant[]).filter((v: Variant) => v.sku).map((v: Variant) => [v.sku as string, v])
    );
    const toDelete = existingVariants.filter((v: any) => !referencedVariantIds.has(v.id) && (!v.sku || !incomingBySku[v.sku]));
    const toUpdate = existingVariants.filter((v: any) => referencedVariantIds.has(v.id) && v.sku && incomingBySku[v.sku]);
    const toCreate = (variations || []).filter((v: Variant) => !v.sku || !existingVariants.some((ev: any) => ev.sku === v.sku));

    for (const v of toDelete) {
      await prisma1.productVariant.delete({ where: { id: v.id } });
    }

    for (const v of toUpdate) {
      if (!v.sku) continue;
      const newData = incomingBySku[v.sku];
      if (!newData) continue;
      await prisma1.productVariant.update({
        where: { id: v.id },
        data: {
          size: newData.size,
          price: newData.price,
          stock: newData.stock,
          imageUrl: newData.imageUrl ?? null,
        },
      });
    }

    for (const v of toCreate) {
      await prisma1.productVariant.create({
        data: {
          productId: id,
          size: v.size,
          price: v.price,
          stock: v.stock,
          sku: v.sku,
          imageUrl: v.imageUrl,
        },
      });
    }

    const product = await prisma1.product.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        imageUrl: newImageUrl,
      },
      include: { variations: true },
    });

    res.json(product);
  } catch (err: any) {
    console.error("[UPDATE_PRODUCT_ERROR]", err);
    res.status(500).json({ message: err?.message || "Server error" });
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Product ID is required" });

    // Gather variant ids for this product
    const variants = await prisma1.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const variantIds = variants.map((v: any) => v.id);

    // Clear from carts first (safe to delete)
    if (variantIds.length > 0) {
      await prisma1.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
    }


    // Block delete if any referencing order is not DELIVERED or CANCELLED
    if (variantIds.length > 0) {
      const activeOrderRefs = await prisma1.orderItem.findMany({
        where: {
          variantId: { in: variantIds },
          order: {
            NOT: {
              status: { in: ["DELIVERED", "CANCELLED"] }
            }
          }
        },
        select: { id: true, orderId: true, order: { select: { status: true } } },
      });
      if (activeOrderRefs.length > 0) {
        const blockingOrders = activeOrderRefs.map((ref: any) => ({ orderId: ref.orderId, status: ref.order?.status })).filter(Boolean);
        return res.status(409).json({
          message: "Cannot delete product: It has active order history. Consider disabling/hiding it instead.",
          blockingOrders,
        });
      }
    }

    // Delete OrderItems for delivered/cancelled orders referencing these variants
    if (variantIds.length > 0) {
      await prisma1.orderItem.deleteMany({
        where: {
          variantId: { in: variantIds },
          order: {
            status: { in: ["DELIVERED", "CANCELLED"] }
          }
        }
      });
    }

    // Safe to delete variants and product
    await prisma1.productVariant.deleteMany({ where: { productId: id } });
    await prisma1.product.delete({ where: { id } });

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("[DELETE_PRODUCT_ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};
