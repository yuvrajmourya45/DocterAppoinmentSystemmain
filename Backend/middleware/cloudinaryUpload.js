import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadToCloudinary = (buffer, folder = 'doctor-app') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',  // supports images AND PDFs
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

export default upload;
