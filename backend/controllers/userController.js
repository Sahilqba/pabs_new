// const User = require("../models/user");
const bcrypt = require("bcrypt");
const { User, Appointment, LoginUser } = require("../models/user");
const jwt = require("jsonwebtoken");
// const secretKey = "your_secret_key";
require("dotenv").config(); // Load environment variables
const secretKey = process.env.SECRET_KEY;

exports.createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    console.log(`Request body: ${req.body.email}`);
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    console.log(`Hashed password: ${hashedPassword}`);
    const user = new User({
      ...req.body,
      password: hashedPassword,
    });
    console.log(`User: ${user}`);
    await user.save();
    // const token = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: '1h' });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.createAppointment = async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log(`Auth header: ${authHeader}`);
  if (!authHeader) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  console.log(`Token: ${token}`);
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const { disease, allergies, appointmentDate, appointmentTime } = req.body;

    // Check if an appointment with the same userId and appointmentDate already exists
    const existingAppointment = await Appointment.findOne({
      userId: decoded.id,
      appointmentDate,
      appointmentTime,
    });

    if (existingAppointment) {
      return res
        .status(400)
        .send(
          "An appointment with the same date & time already exists for this user"
        );
    }

    const appointment = new Appointment({
      userId: decoded.id,
      disease,
      allergies,
      appointmentDate,
      appointmentTime,
    });

    await appointment.save();
    // res.status(201).json({ message: "Appointment booked successfully" });
    res.status(201).send(appointment);
  } catch (
    err
    // {
    //   res.status(500).send(err.message);
    // }
  ) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired");
    }
    res.status(400).send(error.message);
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`Secret key: ${secretKey}`);
    const user = await LoginUser.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
        expiresIn: "15m",
      });
      res.status(200).json({ user, token });
    } else {
      res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteAppointment = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const { id } = req.params;
    const result = await Appointment.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: "Appointment deleted successfully" });
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired");
    }
    res.status(500).send(err.message);
  }
};

exports.getAppointmentsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    // console.log(`Fetching appointments for user with ID: ${userId}`);
    const appointments = await Appointment.find({ userId: userId });
    if (!appointments) {
      return res.status(404).send("No appointments found for this user");
    }
    res.status(200).json(appointments);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.updateAppointmentDate = async (req, res) => {
  const { appointmentDate } = req.body;

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  if (!appointmentDate) {
    return res.status(400).json({ error: "Appointment date is required" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const { id } = req.params;
    const { appointmentDate, appointmentTime } = req.body;
    // const { appointmentTime } = req.body;
    const result = await Appointment.findByIdAndUpdate(
      id,
      { appointmentDate: appointmentDate, appointmentTime: appointmentTime },
      // { appointmentTime: appointmentTime },
      { new: true }
    );
    if (result) {
      res.status(200).json({
        message: "Appointment date & time updated successfully",
        appointment: result,
      });
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired");
    }
    res.status(400).send(err);
  }
};

//
