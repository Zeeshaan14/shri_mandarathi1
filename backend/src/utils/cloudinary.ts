import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

export const CLOUDINARY_ENABLED = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (CLOUDINARY_ENABLED) {
  cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME as string,
    api_key: CLOUDINARY_API_KEY as string,
    api_secret: CLOUDINARY_API_SECRET as string,
  });
}

export default cloudinary;
