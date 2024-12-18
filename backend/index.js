const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
require('dotenv').config(); // Load environment variables
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
const secretKey = process.env.SECRET_KEY;
const { User} = require("./models/user");
 
// Enable CORS
// app.use(cors());
 
// CORS configuration
const corsOptions = {
  origin: `${frontend_url}`, // Replace with your frontend URL
  credentials: true,
};
 
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
      clientID:
        `${client_ID}`,
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
        role: req.cookies.userRoleGoogle, // Check for the specific role
      });
      // console.log("Existing user:", existingUser);
      // let userRoleGoogle = req.cookies.userRoleGoogle;
      let userRoleGoogle = req.cookies.role;
      if (!existingUser) {
        // If the user does not exist, create a new user
        // console.log("User role from cookies:", userRoleGoogle);
        const newUser = new User({
          email: req.user.emails[0].value,
          name: req.user.displayName,
          userIdinUse: req.user.id,
          role: userRoleGoogle,
        });
        await newUser.save();
      }else {
        // If the user exists, update the user role if necessary
        if (existingUser.role !== userRoleGoogle) {
          existingUser.role = userRoleGoogle;
          await existingUser.save();
        }
      }
      // Generate JWT token
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.emails[0].value,
          role: userRoleGoogle,
        },
        secretKey,
        { expiresIn: "1h" }
      );
 
      // Set cookies
      res.cookie("jwtCookie", token, { httpOnly: false, secure: false }); // Set secure: true in production
      res.cookie("nameFromGoogle", req.user.displayName, {
        httpOnly: false,
        secure: false,
      });
      res.cookie("emailFromGoogle", req.user.emails[0].value, {
        httpOnly: false,
        secure: false,
      });
      res.cookie("userId", req.user.id, { httpOnly: false, secure: false });
      // Redirect to user profile
      res.redirect(`${frontend_url}/userProfile`);
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
 
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});
 
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});