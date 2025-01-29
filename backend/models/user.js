const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // email: { type: String, unique: true },
  email: { type: String }, // Removed unique constraint
  name: String,
  password: String,
  role: { type: String, enum: ["Doctor", "Patient"]},
  department: String,
  filename: {
    type: String,
    // required: true,
  },
  path: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  qualification: String,
  experianceyear: String,
  previousCompany: String,
  contactNumber: String,
  confirmPassword: String
});

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disease: String,
  doctor: String,
  appointmentDate: String,
  appointmentTime: String,
  department: String
});

const userLoginSchema = new mongoose.Schema({
  // email: { type: String, unique: true },
  email: { type: String }, // Removed unique constraint
  password: String,
  role: String
});

const doctorAppointmentSchema = new mongoose.Schema({
  doctor: { type: String }
});

const User = mongoose.model("User", userSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const LoginUser = mongoose.model("LoginUser", userLoginSchema, "users");
// const DoctorAppointment = mongoose.model("DoctorAppointment", doctorAppointmentSchema);


module.exports = {User, LoginUser, Appointment, 
  // DoctorAppointment
};