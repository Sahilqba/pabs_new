const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // email: { type: String, unique: true },
  email: { type: String }, // Removed unique constraint
  name: String,
  password: String,
  role: { type: String, enum: ["Doctor", "Patient"]},
  department: String
});

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disease: String,
  department: String,
  appointmentDate: String,
  appointmentTime: String
});

const userLoginSchema = new mongoose.Schema({
  // email: { type: String, unique: true },
  email: { type: String }, // Removed unique constraint
  password: String,
  role: String
});

const User = mongoose.model("User", userSchema);
const Appointment = mongoose.model("Appointment", appointmentSchema);
const LoginUser = mongoose.model("LoginUser", userLoginSchema, "users");


module.exports = {User, LoginUser, Appointment};