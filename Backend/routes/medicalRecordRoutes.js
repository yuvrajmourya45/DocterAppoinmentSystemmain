import express from 'express';
import multer from 'multer';
import MedicalRecord from '../models/medicalRecordModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadToCloudinary } from '../middleware/cloudinaryUpload.js';

const router = express.Router();

// Use memory storage - upload to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const ext = allowed.test(file.originalname.toLowerCase().split('.').pop());
    if (ext || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents allowed'));
    }
  }
});

// Upload medical record
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, documentType } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'medical-records');

    const record = await MedicalRecord.create({
      user: userId,
      title,
      description,
      documentType,
      file: result.secure_url  // store Cloudinary URL
    });

    res.status(201).json({ message: 'Medical record uploaded successfully', record });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload medical record', error: error.message });
  }
});

// Get user's medical records
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.params.userId, isDeleted: false }).sort({ uploadDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
});

// Get my medical records
router.get('/my-records', authMiddleware, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.user.id, isDeleted: false }).sort({ uploadDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
});

// Delete medical record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ _id: req.params.id, user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    record.isDeleted = true;
    await record.save();
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medical record' });
  }
});

export default router;
