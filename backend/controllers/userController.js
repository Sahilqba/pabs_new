// const User = require("../models/user");
const bcrypt = require('bcrypt');
const { User, NewAppointment, LoginUser} = require("../models/user");
// exports.createUser = async (req, res) => {
//   try {
//     const user = new User(req.body);
//     await user.save();
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

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
    res.status(201).json(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    console.log(`Fetching user with ID: ${req.params.id}`);
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const user = new NewAppointment(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password === password) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await NewAppointment.findByIdAndDelete(id);
    if (result) {
      res.status(200).json({ message: "Appointment deleted successfully" });
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await NewAppointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
