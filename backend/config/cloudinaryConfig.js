// cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME, // e.g., "your_cloud_name"
  api_key: CLOUDINARY_API_KEY,       // e.g., "your_api_key"
  api_secret: CLOUDINARY_API_SECRET, // e.g., "your_api_secret"
});

export default cloudinary;
