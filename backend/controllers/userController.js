// const User = require("../models/user");
const bcrypt = require("bcrypt");
const { User, Appointment, LoginUser } = require("../models/user");
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key";

exports.createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
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

// exports.getUserById = async (req, res) => {
//   try {
//     console.log(`Fetching user with ID: ${req.params.id}`);
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send("User not found");
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

exports.createAppointment = async (req, res) => {
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
    const { disease, allergies, appointmentDate } = req.body;

    // Check if an appointment with the same userId and appointmentDate already exists
    const existingAppointment = await Appointment.findOne({
      userId: decoded.id,
      appointmentDate,
    });

    if (existingAppointment) {
      return res
        .status(400)
        .send("An appointment with the same date already exists for this user");
    }

    const appointment = new Appointment({
      userId: decoded.id,
      disease,
      allergies,
      appointmentDate,
    });

    await appointment.save();
    // res.status(201).json({ message: "Appointment booked successfully" });
    res.status(201).send(appointment);
  } catch (err) 
  // {
  //   res.status(500).send(err.message);
  // }
  {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send("Token has expired");
    }
    res.status(400).send(error.message);
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await LoginUser.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
        expiresIn: "1m",
      });
      res.status(200).json({ user, token });
    } else {
      res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

// exports.deleteAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await NewAppointment.findByIdAndDelete(id);
//     if (result) {
//       res.status(200).json({ message: "Appointment deleted successfully" });
//     } else {
//       res.status(404).json({ message: "Appointment not found" });
//     }
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// };

// exports.getAppointments = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// }

// exports.getAppointmentById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const appointment = await NewAppointment.findById(id);
//     if (!appointment) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }
//     res.status(200).json(appointment);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// };
