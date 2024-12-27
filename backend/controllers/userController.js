// const User = require("../models/user");
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // cb(null, `${Date.now()}-${file.originalname}`);
    cb(null, file.originalname); // Use the original filename
    // cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
const bcrypt = require("bcrypt");
const { User, Appointment, LoginUser } = require("../models/user");
const jwt = require("jsonwebtoken");
// const secretKey = "your_secret_key";
require("dotenv").config(); // Load environment variables
const secretKey = process.env.SECRET_KEY;

exports.createUser = async (req, res) => {
  try {
    // console.log("request body", req.body)
    const existingUser = await User.findOne({
      email: req.body.email,
      role: req.body.role,
    });
    // console.log(`Request body: ${req.body.email}`);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email and role already exists" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    // console.log(`Hashed password: ${hashedPassword}`);
    const user = new User({
      ...req.body,
      password: hashedPassword,
    });
    // console.log(`User: ${user}`);
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
    const { disease, appointmentDate, appointmentTime, doctor, department } = req.body;

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
    if (!disease || !appointmentDate || !appointmentTime || !doctor || !department) {
      return res
        .status(400)
        .json({ error: "All fields are required to book an appointment" });
    }
    const appointment = new Appointment({
      userId: decoded.id,
      disease,
      appointmentDate,
      appointmentTime,
      doctor,
      department
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
    res.status(400).send(err.message);
  }
};

exports.userLogin = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    // console.log(`Secret key: ${secretKey}`);
    const user = await LoginUser.findOne({ email, role });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        secretKey,
        {
          expiresIn: "15m",
        }
      );
      res.status(200).json({ user, token });
    } else {
      res.status(401).send("Invalid email or password or role");
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

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).send("No users found for this user");
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send(error);
  }
};

// exports.updateDepartment = async (req, res) => {
//   const { department, image } = req.body;

//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send("Unauthorized");
//   }

//   const token = authHeader.split(" ")[1];
//   if (!token) {
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     const { id } = req.params;
//     const updateData = { department };
//     if (image) {
//       updateData.image = image; // Add image to update data if provided
//     }
//     const result = await User.findByIdAndUpdate(
//       id, updateData, { new: true });
//     if (result) {
//       res.status(200).json({
//         message: "Department and image updated successfully",
//         user: result,
//       });
//     } else {
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (err) {
//     if (err.name === "TokenExpiredError") {
//       return res.status(401).send("Token has expired");
//     }
//     res.status(400).send(err);
//   }
// };

exports.updateDepartment = [
  upload.single('image'), // Middleware to handle file upload
  async (req, res) => {
    const { department } = req.body;
    const image = req.file; // Access the uploaded file

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
      const updateData = { department };
      if (image) {
        // updateData.image = image.path; // Save the file path or handle the file as needed
        updateData.filename = image.filename; // Save the original file name
        updateData.path = image.path; // Save the original file name
        updateData.createdAt = image.createdAt; // Save the original file name
      }
      const result = await User.findByIdAndUpdate(id, updateData, { new: true });
      if (result) {
        res.status(200).json({
          message: "Department and image updated successfully",
          user: result,
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send("Token has expired");
      }
      res.status(400).send(err);
    }
  }
];

exports.doctorAppointments = async (req, res) => {
  const { doctor} = req.body;
  try {
    const user = await Appointment.find({ doctor });
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(401).send("Invalid user");
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getDoctorDepartmentByUserId = async (req, res) => {
  try {
    console.log(`Fetching department for user with ID: ${req.params.userId}`);
    const userId = req.params.userId;
    // const user = await User.find({ userId: userId });
    const user = await User.findById(userId);
    console.log(`User: ${user}`);
    if (!user) {
      return res.status(404).send("No user found");
    }
    if (user.role !== 'Doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
  }
  if (!user.department) {
    return res.status(400).json({ message: 'No department selected' });
}
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

// exports.getUserbyId = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const users = await User.findById(userId);
//     if (!users) {
//       return res.status(404).send("No users found for this user");
//     }
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };

exports.getUserbyId = async (req, res) => {
  try {
    const userIds = req.query.userIds.split(',');
    const users = await User.find({ _id: { $in: userIds } });
    if (!users.length) {
      return res.status(404).send("No users found for the provided IDs");
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send(error);
  }
};

//
