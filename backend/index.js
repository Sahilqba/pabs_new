const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");
require("dotenv").config(); // Load environment variables
const port = process.env.PORT;
const mongoPassword = process.env.MONGODB_PASSWORD;
const appName = process.env.APP_NAME;
const frontend_url = process.env.FRONTEND_URL;
const backend_url = process.env.BACKEND_URL;
const client_ID = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const secretKey = process.env.SECRET_KEY;
const { User } = require("./models/user");
const twilio = require("twilio");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Add your Twilio Account SID here
const authToken = process.env.TWILIO_AUTH_TOKEN; // Add your Twilio Auth Token here
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID; // Add your Twilio Verify Service SID here
const client = twilio(accountSid, authToken);
const axios = require("axios");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
// Enable CORS
// app.use(cors());

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  // 200 requests per hour
  max: 2000,
  windowMs: 60 * 60 * 1000, //1 hour in milliseconds
  message: "Too many requests from this IP",
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: `${frontend_url}`, // Replace with your frontend URL
  credentials: true,
};

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  session({ secret: "your_secret_key", resave: false, saveUninitialized: true })
);
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: `${client_ID}`,
      clientSecret: `${client_secret}`,
      callbackURL: `${backend_url}/auth/google/callback`,
    },
    function (accessToken, refreshToken, profile, done) {
      // Here you can save the user profile to your database
      // console.log("Access Token:", accessToken);
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    `mongodb+srv://${appName}:${mongoPassword}@cluster0.oullp.mongodb.net/demoAppdbName`
  );
}

// Use routes
app.use("/", userRoutes);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   async function (req, res) {
//     try {
//       if (mongoose.connection.readyState !== 1) {
//         throw new Error("Mongoose is not connected");
//       }
//       const existingUser = await User.findOne({
//         email: req.user.emails[0].value,
//         role: req.cookies.userRoleGoogle,
//         // isDoctor: req.cookies.isDoctor,
//       });
//       // console.log("Existing user:", existingUser);
//       let userId;
//       if (existingUser) {
//         existingUser.isDoctor = req.cookies.isDoctor;
//         await existingUser.save();
//         userId = existingUser._id.toString();
//         res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
//         res.cookie("googleEmail", existingUser.email, { httpOnly: false, secure: false });
//         console.log("Existing user is ", existingUser);
//       } else {
//         // If the user does not exist, create a new user
//         const photoUrl = req.user.photos[0].value;
//         const filename = `${uuidv4()}.png`;
//         const filePath = path.join(__dirname, "uploads", filename);
//         // Download the image and save it to the uploads folder
//         const response = await axios({
//           url: photoUrl,
//           responseType: "stream",
//         });
//         response.data.pipe(fs.createWriteStream(filePath));
//         const newUser = new User({
//           email: req.user.emails[0].value,
//           name: req.user.displayName,
//           userIdinUse: req.user.id,
//           role: req.cookies.userRoleGoogle,
//           filename: filename,
//           path: `uploads/${filename}`,
//           isDoctor: req.cookies.isDoctor,
//         });
//         await newUser.save();
//         userId = newUser._id.toString();
//         res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
//         res.cookie("googleEmail", newUser.email, { httpOnly: false, secure: false });
//       }
//       // Generate JWT token with MongoDB ObjectId
//       const token = jwt.sign(
//         {
//           id: userId,
//           email: req.user.emails[0].value,
//           role: req.cookies.userRoleGoogle,
//         },
//         secretKey,
//         { expiresIn: "15m" }
//       );

//       // Set cookies
//       res.cookie("jwtCookie", token, { httpOnly: false, secure: false });
//       res.cookie("nameFromGoogle", req.user.displayName, {
//         httpOnly: false,
//         secure: false,
//       });
//       res.cookie("emailFromGoogle", req.user.emails[0].value, {
//         httpOnly: false,
//         secure: false,
//       });
//       res.cookie("userId", userId, { httpOnly: false, secure: false });
//       // Redirect to user profile
//       res.redirect(`${frontend_url}/userProfile`);
//     } catch (error) {
//       console.error("Error during Google OAuth callback:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   async function (req, res) {
//     try {
//       if (mongoose.connection.readyState !== 1) {
//         throw new Error("Mongoose is not connected");
//       }
//       const existingUser = await User.findOne({
//         email: req.user.emails[0].value,
//         role: req.cookies.userRoleGoogle,
//         // isDoctor: req.cookies.isDoctor,
//       });
//       // console.log("Existing user:", existingUser);
//       let userId;
//       if (existingUser) {
//         existingUser.isDoctor = req.cookies.isDoctor;
//         await existingUser.save();
//         userId = existingUser._id.toString();
//         res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
//         res.cookie("googleEmail", existingUser.email, {
//           httpOnly: false,
//           secure: false,
//         });
//         console.log("Existing user is ", existingUser);

//         // Generate JWT token with MongoDB ObjectId
//         const token = jwt.sign(
//           {
//             id: userId,
//             email: req.user.emails[0].value,
//             role: req.cookies.userRoleGoogle,
//           },
//           secretKey,
//           { expiresIn: "15m" }
//         );

//         // Set cookies
//         res.cookie("jwtCookie", token, { httpOnly: false, secure: false });
//         res.cookie("nameFromGoogle", req.user.displayName, {
//           httpOnly: false,
//           secure: false,
//         });
//         res.cookie("emailFromGoogle", req.user.emails[0].value, {
//           httpOnly: false,
//           secure: false,
//         });
//         res.cookie("userId", userId, { httpOnly: false, secure: false });

//         // Redirect to user profile
//         res.redirect(`${frontend_url}/userProfile`);
//       } else {
//         // If the user does not exist, create a new user
//         const photoUrl = req.user.photos[0].value;
//         const filename = `${uuidv4()}.png`;
//         const filePath = path.join(__dirname, "uploads", filename);
//         // Download the image and save it to the uploads folder
//         const response = await axios({
//           url: photoUrl,
//           responseType: "stream",
//         });
//         response.data.pipe(fs.createWriteStream(filePath));
//         const newUser = new User({
//           email: req.user.emails[0].value,
//           name: req.user.displayName,
//           userIdinUse: req.user.id,
//           role: req.cookies.userRoleGoogle,
//           filename: filename,
//           path: `uploads/${filename}`,
//           isDoctor: req.cookies.isDoctor,
//         });
//         await newUser.save();
//         userId = newUser._id.toString();
//         res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
//         res.cookie("googleEmail", newUser.email, {
//           httpOnly: false,
//           secure: false,
//         });

//         // Redirect to role selection page
//         res.redirect(`${frontend_url}/googleRoleSelect`);
//       }
//     } catch (error) {
//       console.error("Error during Google OAuth callback:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );

//-------working----------//
// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   async function (req, res) {
//     try {
//       if (mongoose.connection.readyState !== 1) {
//         throw new Error("Mongoose is not connected");
//       }
//       const existingUser = await User.findOne({
//         email: req.user.emails[0].value,
//         // role: req.cookies.userRoleGoogle,
//         // isDoctor: req.cookies.isDoctor,
//       });
//       console.log("Existing user:", existingUser);
//       let userId;
//       if (existingUser) {
//         // existingUser.isDoctor = req.cookies.isDoctor;
//         await existingUser.save();
//         userId = existingUser._id.toString();
//         res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
//         res.cookie("googleEmail", existingUser.email, {
//           httpOnly: false,
//           secure: false,
//         });
//         res.cookie("isDoctor", existingUser.isDoctor, {
//           httpOnly: false,
//           secure: false,
//         });
//         console.log("Existing user is ", existingUser);
//       } else {
//         // If the user does not exist, create a new user
//         const photoUrl = req.user.photos[0].value;
//         const filename = `${uuidv4()}.png`;
//         const filePath = path.join(__dirname, "uploads", filename);
//         // Download the image and save it to the uploads folder
//         const response = await axios({
//           url: photoUrl,
//           responseType: "stream",
//         });
//         response.data.pipe(fs.createWriteStream(filePath));
//         const newUser = new User({
//           email: req.user.emails[0].value,
//           name: req.user.displayName,
//           userIdinUse: req.user.id,
//           role: req.cookies.userRoleGoogle,
//           filename: filename,
//           path: `uploads/${filename}`,
//           isDoctor: req.cookies.isDoctor,
//         });
//         await newUser.save();
//         userId = newUser._id.toString();
//         res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
//         res.cookie("googleEmail", newUser.email, {
//           httpOnly: false,
//           secure: false,
//         });
//       }

//       // Generate JWT token with MongoDB ObjectId
//       const token = jwt.sign(
//         {
//           id: userId,
//           email: req.user.emails[0].value,
//           role: req.cookies.userRoleGoogle,
//         },
//         secretKey,
//         { expiresIn: "15m" }
//       );

//       // Set cookies
//       res.cookie("jwtCookie", token, { httpOnly: false, secure: false });
//       res.cookie("nameFromGoogle", req.user.displayName, {
//         httpOnly: false,
//         secure: false,
//       });
//       res.cookie("emailFromGoogle", req.user.emails[0].value, {
//         httpOnly: false,
//         secure: false,
//       });
//       res.cookie("userId", userId, { httpOnly: false, secure: false });

//       if (existingUser) {
//         // Redirect to user profile
//         console.log("existingUser.isDoctor", existingUser.isDoctor);
//         console.log("existingUser.role", existingUser.role);
//         res.redirect(`${frontend_url}/userProfile`);
//       } else {
//         // Redirect to role selection page
//         res.redirect(`${frontend_url}/googleRoleSelect`);
//       }
//     } catch (error) {
//       console.error("Error during Google OAuth callback:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// );
//-------working----------//

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async function (req, res) {
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error("Mongoose is not connected");
      }
      const existingUser = await User.findOne({
        email: req.user.emails[0].value,
        // role: req.cookies.userRoleGoogle,
        // isDoctor: req.cookies.isDoctor,
      });
      // console.log("Existing user:", existingUser);
      let userId;
      if (existingUser) {
        // existingUser.isDoctor = req.cookies.isDoctor;
        await existingUser.save();
        userId = existingUser._id.toString();
        res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
        res.cookie("googleEmail", existingUser.email, {
          httpOnly: false,
          secure: false,
        });
        res.cookie("isDoctor", existingUser.isDoctor, {
          httpOnly: false,
          secure: false,
        });
        // console.log("Existing user is ", existingUser);
      } else {
        // If the user does not exist, create a new user
        const photoUrl = req.user.photos[0].value;
        const filename = `${uuidv4()}.png`;
        const filePath = path.join(__dirname, "uploads", filename);
        // Download the image and save it to the uploads folder
        const response = await axios({
          url: photoUrl,
          responseType: "stream",
        });
        response.data.pipe(fs.createWriteStream(filePath));
        const newUser = new User({
          email: req.user.emails[0].value,
          name: req.user.displayName,
          userIdinUse: req.user.id,
          role: req.cookies.userRoleGoogle,
          filename: filename,
          path: `uploads/${filename}`,
          isDoctor: req.cookies.isDoctor,
        });
        await newUser.save();
        userId = newUser._id.toString();
        res.cookie("userIdinDb", userId, { httpOnly: false, secure: false });
        res.cookie("googleEmail", newUser.email, {
          httpOnly: false,
          secure: false,
        });
      }

      // Generate JWT token with MongoDB ObjectId
      const token = jwt.sign(
        {
          id: userId,
          email: req.user.emails[0].value,
          role: req.cookies.userRoleGoogle,
        },
        secretKey,
        { expiresIn: "15m" }
      );

      // Set cookies
      res.cookie("jwtCookie", token, { httpOnly: false, secure: false });
      res.cookie("nameFromGoogle", req.user.displayName, {
        httpOnly: false,
        secure: false,
      });
      res.cookie("emailFromGoogle", req.user.emails[0].value, {
        httpOnly: false,
        secure: false,
      });
      res.cookie("userId", userId, { httpOnly: false, secure: false });

      if (existingUser) {
        // Redirect to user profile
        console.log("existingUser.isDoctor", existingUser.isDoctor);
        console.log("existingUser.role", existingUser.role);
        // if (existingUser.isDoctor && existingUser.role) {
        //   res.redirect(`${frontend_url}/userProfile`);
        // }
        if (existingUser.isDoctor !== undefined && existingUser.role !== undefined) {
          res.redirect(`${frontend_url}/userProfile`);
        }
         else {
          console.log("hihihihihihi")
          res.redirect(`${frontend_url}/googleRoleSelect`);
        }
      } else {
        // Redirect to role selection page
        console.log("hihihihihihi")
        res.redirect(`${frontend_url}/googleRoleSelect`);
      }
    } catch (error) {
      console.error("Error during Google OAuth callback:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);



app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Session destruction failed" });
      }
      res.clearCookie("connect.sid", { path: "/" });
      res.clearCookie("jwtCookie", { path: "/" });
      res.clearCookie("userId", { path: "/" });
      res.clearCookie("nameFromGoogle", { path: "/" });
      res.clearCookie("emailFromGoogle", { path: "/" });
      res.clearCookie("userRoleGoogle", { path: "/" });
      res.clearCookie("role", { path: "/" });
      res.clearCookie("userIdinDb", { path: "/" });
      res.clearCookie("isDoctor", { path: "/" });
      res.clearCookie("googleEmail", { path: "/" });
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

// Endpoint to send OTP
// app.post("/sendOtp", (req, res) => {
//   const { contactNumber, email, role } = req.body;
//   if (!contactNumber || !email || !role) {
//     return res.status(400).send({ error: "Contact number, email, and role are required" });
//   }
//   const phoneNumber = parsePhoneNumberFromString(contactNumber, 'US'); // Replace 'US' with the default country code if needed
// console.log(phoneNumber);
// console.log(contactNumber)
//   if (!phoneNumber || !phoneNumber.isValid()) {
//     return res.status(400).send({ error: "Invalid phone number" });
//   }

//   const formattedNumber = phoneNumber.number; // Get the number in E.164 format
//   console.log("Format num :", formattedNumber );
//   client.verify.v2.services(verifyServiceSid)
//     .verifications
//     .create({to: formattedNumber, channel: 'sms'})
//     .then(verification => res.status(200).send({ sid: verification.sid, email, role }))
//     .catch(err => {
//       console.error("Error sending OTP:", err.message, err.stack);
//       res.status(500).send({ error: "Failed to send OTP" });
//     });
// });
app.post("/sendOtp", (req, res) => {
  const { contactNumber, email } = req.body;
  if (!contactNumber || !email) {
    return res
      .status(400)
      .send({ error: "Contact number, email, and role are required" });
  }
  const phoneNumber = parsePhoneNumberFromString(contactNumber, "US"); // Replace 'US' with the default country code if needed
  console.log(phoneNumber);
  console.log(contactNumber);
  if (!phoneNumber || !phoneNumber.isValid()) {
    return res.status(400).send({ error: "Invalid phone number" });
  }

  const formattedNumber = phoneNumber.number; // Get the number in E.164 format
  console.log("Format num :", formattedNumber);
  client.verify.v2
    .services(verifyServiceSid)
    .verifications.create({ to: formattedNumber, channel: "sms" })
    .then((verification) =>
      res.status(200).send({ sid: verification.sid, email })
    )
    .catch((err) => {
      console.error("Error sending OTP:", err.message, err.stack);
      res.status(500).send({ error: "Failed to send OTP" });
    });
});
// Endpoint to verify OTP
app.post("/verifyOtp", (req, res) => {
  const { sid, token } = req.body;
  client.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({ verificationSid: sid, code: token })
    .then((verification_check) => {
      if (verification_check.status === "approved") {
        res.status(200).send({
          message: "OTP verified successfully",
          sid: verification_check.sid,
          status: verification_check.status,
        });
      } else {
        res.status(400).send({
          error: "Invalid OTP",
          sid: verification_check.sid,
          status: verification_check.status,
        });
      }
    })
    .catch((err) => {
      console.error("Error verifying OTP:", err);
      res.status(500).send({ error: "Failed to verify OTP" });
    });
});

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
