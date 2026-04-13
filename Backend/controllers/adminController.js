import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "../models/UserModel.js";
import DoctorModel from "../models/DoctorModel.js";
import AppointmentModel from "../models/appointmentModel.js";
import MedicalRecord from "../models/medicalRecordModel.js";
import { uploadToCloudinary } from "../middleware/cloudinaryUpload.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const BASE_URL = process.env.BACKEND_URL || "https://docterappoinmentsystemmain.onrender.com";

const adminCheck = (req) => req.user.role !== "admin" ? { error: true } : null;

// ==================== ADMIN LOGIN =========================
export const loginAdmin = async (req, res) => {
  try {
    if (req.body.email === process.env.ADMIN_EMAIL && req.body.password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({ message: "Login ok", token, user: { role: "admin", email: process.env.ADMIN_EMAIL } });
    }
    res.status(401).json({ message: "Invalid" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== GET ADMIN DETAILS =========================
export const getAdminDetails = (req, res) => {
  if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
  res.json({ name: "Admin", email: process.env.ADMIN_EMAIL });
};

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const recentApts = await AppointmentModel.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5);
    const processedApts = await Promise.all(recentApts.map(async (apt) => {
      const obj = apt.toObject();
      if (typeof obj.doctor === 'string' && obj.doctor.match(/^[0-9a-fA-F]{24}$/)) {
        const doc = await DoctorModel.findById(obj.doctor).select('name speciality image');
        if (doc) {
          const docObj = doc.toObject();
          if (docObj.image && !docObj.image.startsWith('http')) {
            docObj.image = `${BASE_URL}${docObj.image.startsWith('/') ? '' : '/'}${docObj.image}`;
          }
          obj.doctor = docObj;
        }
      }
      return obj;
    }));
    res.json({
      totalUsers: await User.countDocuments(),
      totalDoctors: await DoctorModel.countDocuments(),
      totalAppointments: await AppointmentModel.countDocuments(),
      todayAppointments: await AppointmentModel.countDocuments({ date: new Date().toISOString().split('T')[0] }),
      recentAppointments: processedApts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===================== GET ALL APPOINTMENTS ========================
export const getAllAppointments = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const apts = await AppointmentModel.find().populate("user", "name email").sort({ createdAt: -1 });
    const processed = await Promise.all(apts.map(async (apt) => {
      const obj = apt.toObject();
      if (typeof obj.doctor === 'string' && obj.doctor.match(/^[0-9a-fA-F]{24}$/)) {
        const doc = await DoctorModel.findById(obj.doctor).select('name speciality image');
        if (doc) obj.doctor = doc.toObject();
      }
      return obj;
    }));
    res.json({ appointments: processed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================= UPDATE APPOINTMENT STATUS =======================
export const updateAppointmentStatus = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const { appointmentId, status } = req.body;
    const data = { status, cancelled: status === 'rejected', isCompleted: status === 'completed' };
    const apt = await AppointmentModel.findByIdAndUpdate(appointmentId, data, { new: true }).populate("doctor", "name speciality image").populate("user", "name email");
    res.json({ message: `${status}`, appointment: apt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== CANCEL APPOINTMENT =============================
export const cancelAppointment = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    await AppointmentModel.findByIdAndUpdate(req.body.appointmentId, { cancelled: true, isCompleted: false });
    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== GET ALL DOCTORS =================================
export const getAllDoctors = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    res.json(await DoctorModel.find().select("-password"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================== TOGGLE DOCTOR AVAILABILITY ===========================
export const toggleDoctorAvailability = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const doc = await DoctorModel.findById(req.body.docId);
    if (!doc) return res.status(404).json({ message: "Not found" });
    doc.available = !doc.available;
    await doc.save();
    res.json({ message: "Changed", available: doc.available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================== VERIFY DOCTOR =====================================
export const verifyDoctor = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const doc = await DoctorModel.findById(req.body.docId);
    if (!doc) return res.status(404).json({ message: "Not found" });
    doc.isVerified = !doc.isVerified;
    await doc.save();
    res.json({ message: doc.isVerified ? "Verified" : "Unverified", isVerified: doc.isVerified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================= ADD DOCTOR ==================================
export const addDoctor = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    if (await DoctorModel.findOne({ email: req.body.email })) return res.status(400).json({ message: "Exists" });
    
    let addr = req.body.address;
    try { addr = typeof addr === 'string' ? JSON.parse(addr) : addr; } catch { addr = { line1: addr, line2: "" }; }
    
    let workingHours = req.body.workingHours;
    try { workingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours; } catch { workingHours = { start: "09:00 AM", end: "05:00 PM" }; }
    
    console.log('Working Hours Received:', req.body.workingHours);
    console.log('Working Hours Parsed:', workingHours);
    
    const doc = await new DoctorModel({
      ...req.body,
      password: await bcryptjs.hash(req.body.password, 10),
      image: req.file ? (await uploadToCloudinary(req.file.buffer, 'doctor-app')).secure_url : "",
      address: addr,
      workingHours,
      available: req.body.available === 'true' || req.body.available === true,
      isVerified: req.body.isVerified === 'true' || req.body.isVerified === true
    }).save();
    
    console.log('Doctor Saved:', doc.workingHours);
    res.status(201).json({ message: "Added", doctor: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================ UPDATE DOCTOR ==============================
export const updateDoctor = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const data = { ...req.body };
    if (req.file) data.image = (await uploadToCloudinary(req.file.buffer, 'doctor-app')).secure_url;
    if (data.password) data.password = await bcryptjs.hash(data.password, 10);
    const doc = await DoctorModel.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ message: "Updated", doctor: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================ DELETE DOCTOR ============================
export const deleteDoctor = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    await DoctorModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== GET ALL USERS ================================
export const getAllUsers = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    res.json(await User.find().select("-password"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== ADD USER ====================================
export const addUser = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    if (await User.findOne({ email: req.body.email })) return res.status(400).json({ message: "Exists" });
    const user = await new User({ ...req.body, password: await bcryptjs.hash(req.body.password, 10) }).save();
    res.status(201).json({ message: "Added", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== UPDATE USER ==================================
export const updateUser = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const data = { name: req.body.name, email: req.body.email };
    if (req.body.password) data.password = await bcryptjs.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ message: "Updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===================== DELETE USER =================================
export const deleteUser = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===================== GET PATIENT MEDICAL RECORDS =================================
export const getPatientMedicalRecords = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const patient = await User.findById(req.params.userId).select('name email medicalHistory');
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    
    const medicalRecords = await MedicalRecord.find({ user: req.params.userId, isDeleted: false }).sort({ uploadDate: -1 });
    
    res.json({ success: true, patient: { ...patient.toObject(), medicalRecords } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===================== GET PATIENT APPOINTMENTS =================================
export const getPatientAppointments = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    const appointments = await AppointmentModel.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    
    // Populate doctor details
    const processedAppointments = await Promise.all(appointments.map(async (apt) => {
      const obj = apt.toObject();
      if (typeof obj.doctor === 'string' && obj.doctor.match(/^[0-9a-fA-F]{24}$/)) {
        const doc = await DoctorModel.findById(obj.doctor).select('name speciality image');
        if (doc) obj.doctor = doc.toObject();
      }
      return obj;
    }));
    
    res.json({ success: true, appointments: processedAppointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===================== DELETE PATIENT RECORD =================================
export const deletePatientRecord = async (req, res) => {
  try {
    if (adminCheck(req)?.error) return res.status(403).json({ message: "Admin only" });
    await MedicalRecord.findByIdAndUpdate(req.params.recordId, { isDeleted: true });
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
