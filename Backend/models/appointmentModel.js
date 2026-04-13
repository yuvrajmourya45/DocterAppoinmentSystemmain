import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.Mixed, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userData: { type: Object },
  docData: { type: Object },
  amount: { type: Number, required: true },
  speciality: { type: String },
  date_booked: { type: Number, default: Date.now },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  cancelledAt: { type: Date },
  cancelledBy: { type: String, enum: ['user', 'doctor', 'admin'] },
  cancellationReason: { type: String },
  hasMedicalRecords: { type: Boolean, default: false },
  medicalRecordsCount: { type: Number, default: 0 },
  prescription: {
    diagnosis: { type: String },
    medicines: [{
      name: { type: String },
      dosage: { type: String },
      duration: { type: String },
      instructions: { type: String }
    }],
    notes: { type: String },
    addedAt: { type: Date }
  }
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);

