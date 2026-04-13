import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Appointment from "../models/appointmentModel.js";
import DoctorModel from "../models/DoctorModel.js";

// ======================= SIGN UP =====================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================= LOGIN =====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================= UPDATE PROFILE =====================
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, gender } = req.body;
    const updateData = { name, phone, gender };
    if (req.file) updateData.profilePic = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =================== BOOK APPOINTMENT =====================
export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "user") return res.status(403).json({ message: "Only users can book appointments" });

    const { doctor: docId, date, time, speciality } = req.body;

    const doctorData = await DoctorModel.findById(docId).select("-password");
    if (!doctorData) return res.status(404).json({ message: "Doctor not found" });
    if (!doctorData.available) return res.status(400).json({ message: "Doctor is currently unavailable for appointments" });

    const existingAppointment = await Appointment.findOne({
      doctor: docId,
      date,
      time,
      cancelled: false,
      status: { $nin: ['completed', 'rejected'] } 
    });
    if (existingAppointment) return res.status(400).json({ message: "This slot is already booked" });

    const newAppointment = new Appointment({
      user: req.user.id,
      doctor: docId,
      date,
      time,
      amount: doctorData.fees || 0,
      docData: doctorData,
      date_booked: Date.now()
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!", appointment: newAppointment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// =============== GET APPOINTMENTS =================
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const appointments = await Appointment.find({ user: userId }).sort({ createdAt: -1 });

    const processedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        const aptObj = apt.toObject();
        if (typeof aptObj.doctor === 'string' && aptObj.doctor.match(/^[0-9a-fA-F]{24}$/)) {
          const doctor = await DoctorModel.findById(aptObj.doctor).select('name speciality image fees degree');
        if (doctor) {
            const docObj = doctor.toObject();
            if (docObj.image && !docObj.image.startsWith('http')) {
              const baseUrl = process.env.BACKEND_URL || 'https://docterappoinmentsystemmain.onrender.com';
              docObj.image = docObj.image.startsWith('/') ? `${baseUrl}${docObj.image}` : `${baseUrl}/uploads/${docObj.image}`;
            }
            aptObj.doctor = docObj;
          }
        }
        return aptObj;
      })
    );

    res.json(processedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== CANCEL APPOINTMENT =====================
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

    appointment.cancelled = true;
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = 'user';
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully!", refundEligible: appointment.status === 'confirmed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============== DELETE APPOINTMENT ==================
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment cancelled successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error while cancelling appointment" });
  }
};

// =============== UPDATE APPOINTMENT STATUS ==================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = status;
    await appointment.save();
    res.json({ message: "Appointment status updated successfully!", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

