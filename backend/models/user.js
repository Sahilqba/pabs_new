const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const appointmentSchema = new mongoose.Schema({
  nameUser: String,
  nameEmail: String,
  disease: String,
  contact: String,
  bloodGroup: String,
  date: Date,
});

const userLoginSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema, "regCollection");
const NewAppointment = mongoose.model("NewAppointment", appointmentSchema, "appointmentCollection");
const LoginUser = mongoose.model("LoginUser", userLoginSchema, "regCollection");


module.exports = {User, NewAppointment, LoginUser};