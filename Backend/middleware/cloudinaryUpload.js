import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Use memory storage - file goes to buffer, then cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Upload buffer to cloudinary
export const uploadToCloudinary = (buffer, folder = 'doctor-app') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, allowed_formats: ['jpg', 'jpeg', 'png'] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

export default upload;
