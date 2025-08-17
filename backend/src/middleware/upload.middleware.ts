import multer from "multer";
import path from "path";
import fs from "fs";
import { IMAGEKIT_ENABLED } from "../utils/imagekit.js";

// When ImageKit is enabled, keep files in memory for streaming upload
// Otherwise, persist to local uploads folder so we can serve them
let storage: multer.StorageEngine;

if (IMAGEKIT_ENABLED) {
  storage = multer.memoryStorage();
} else {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

export const upload = multer({ storage });
