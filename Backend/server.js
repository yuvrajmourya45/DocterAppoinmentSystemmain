import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRoute from "./routes/userRoute.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Models
import doctorModel from "./models/DoctorModel.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://docter-appoinment-systemmain.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));


app.use(express.json());

// Uploads Folder Setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/docter";
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected ->", mongoUri))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);

// Public Doctors Endpoint
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    const doctorsWithImageUrl = doctors.map(doc => {
      const obj = doc.toObject();
      if (obj.image) {
        const baseUrl = process.env.BACKEND_URL || 'https://docterappoinmentsystemmain.onrender.com';
        if (obj.image.startsWith('http')) {
        } else if (obj.image.startsWith('/')) {
          obj.image = `${baseUrl}${obj.image}`;
        } else {
          obj.image = `${baseUrl}/uploads/${obj.image}`;
        }
      }
      return { ...obj, available: obj.available !== undefined ? obj.available : true };
    });
    res.json(doctorsWithImageUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug Endpoint
app.get("/api/debug/appointments", async (req, res) => {
  try {
    const Appointment = (await import("./models/appointmentModel.js")).default;
    const allAppointments = await Appointment.find();
    res.json({ count: allAppointments.length, appointments: allAppointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug Endpoint - check env vars
app.get("/api/debug", (req, res) => {
  res.json({
    jwt_secret_set: !!process.env.JWT_SECRET,
    admin_email_set: !!process.env.ADMIN_EMAIL,
    mongo_set: !!process.env.MONGO_URI,
    node_env: process.env.NODE_ENV,
    version: "2.0"
  });
});

// Server Start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
