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
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
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
        if (obj.image.startsWith('http')) {
        } else if (obj.image.startsWith('/')) {
          obj.image = `http://localhost:8000${obj.image}`;
        } else {
          obj.image = `http://localhost:8000/uploads/${obj.image}`;
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

// Server Start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
