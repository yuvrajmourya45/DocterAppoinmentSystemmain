import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DoctorModel from "../models/DoctorModel.js";
import Appointment from "../models/appointmentModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const BASE_URL = process.env.BACKEND_URL || "https://docterappoinmentsystemmain.onrender.com";

// ================== DOCTOR LOGIN ===================
export const loginDoctor = async (req, res) => {
  try {
    const doc = await DoctorModel.findOne({ email: req.body.email });
    if (!doc || !(await bcrypt.compare(req.body.password, doc.password)))
      return res.status(401).json({ message: "Invalid" });
    const token = jwt.sign({ id: doc._id, role: "doctor" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login ok", token, doctor: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== GET DOCTOR PROFILE ======================
export const getDoctorProfile = async (req, res) => {
  try {
    const doc = await DoctorModel.findById(req.params.id).select("-password");
    if (!doc) return res.status(404).json({ message: "Not found" });
    const obj = doc.toObject();
    if (obj.image && !obj.image.startsWith("http")) {
      obj.image = `${BASE_URL}${obj.image.startsWith("/") ? "" : "/"}${obj.image}`;
    }
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== UPDATE DOCTOR AVAILABILITY =======================
export const updateDoctorAvailability = async (req, res) => {
  try {
    const doc = await DoctorModel.findByIdAndUpdate(req.params.id, { available: req.body.available }, { new: true });
    res.json({ message: "Updated", available: doc.available });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== UPDATE DOCTOR PROFILE =========================
export const updateDoctorProfile = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.body.address) data.address = JSON.parse(req.body.address);
    if (req.file) data.image = req.file.filename;
    const doc = await DoctorModel.findByIdAndUpdate(req.params.id, data, { new: true }).select('-password');
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== GET DOCTOR APPOINTMENTS =========================
export const getDoctorAppointments = async (req, res) => {
  try {
    const apts = await Appointment.find({ doctor: req.params.doctorId, cancelled: false }).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ appointments: apts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== COMPLETE APPOINTMENT ==============================
export const completeAppointment = async (req, res) => {
  try {
    const apt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'completed', isCompleted: true }, { new: true }).populate('user', 'name email');
    if (!apt) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Completed", appointment: apt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================= UPDATE APPOINTMENT STATUS ==========================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ message: "Not found" });
    apt.status = req.body.status;
    if (req.body.status === 'rejected') {
      apt.cancelled = true;
      apt.cancelledAt = new Date();
      apt.cancelledBy = 'doctor';
    }
    if (req.body.status === 'confirmed') apt.cancelled = false;
    if (req.body.status === 'completed') {
      apt.isCompleted = true;
      apt.cancelled = false;
    }
    await apt.save();
    const updated = await Appointment.findById(req.params.id).populate('user', 'name');
    res.json({ message: `${req.body.status}`, appointment: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= GET PATIENT HISTORY WITH FILTERS ==========================
export const getPatientHistory = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate, patientName, status } = req.query;
    
    let query = { doctor: doctorId };
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const appointments = await Appointment.find(query)
      .populate('user', 'name email phone')
      .sort({ date: -1, time: -1 });
    
    let filtered = appointments;
    
    if (patientName) {
      filtered = filtered.filter(apt => 
        apt.user?.name?.toLowerCase().includes(patientName.toLowerCase())
      );
    }
    
    if (status) {
      filtered = filtered.filter(apt => apt.status === status);
    }
    
    // Stats for graphs
    const stats = {
      total: filtered.length,
      completed: filtered.filter(a => a.status === 'completed').length,
      cancelled: filtered.filter(a => a.cancelled).length,
      pending: filtered.filter(a => a.status === 'pending').length,
      confirmed: filtered.filter(a => a.status === 'confirmed').length,
    };
    
    res.json({ appointments: filtered, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
