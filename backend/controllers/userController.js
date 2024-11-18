// const User = require("../models/user");
const bcrypt = require("bcrypt");
const { User, NewAppointment, LoginUser } = require("../models/user");
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key";

exports.createUser = async (req, res) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    console.log(`Hashed password: ${hashedPassword}`);
    const user = new User({
      ...req.body,
      password: hashedPassword
    });
    console.log(`User: ${user}`);
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.status(201).json({ user, token });
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

// exports.createAppointment = async (req, res) => {
//   try {
//     const user = new NewAppointment(req.body);
//     await user.save();
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };


exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await LoginUser.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id, email: user.email }, secretKey, {
        expiresIn: "1h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(200).json({ user, token });
    } else {
      res.status(401).send('Unauthorized');
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
