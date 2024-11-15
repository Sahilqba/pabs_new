const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
require('dotenv').config(); // Load environment variables
const port = process.env.PORT;
const mongoPassword = process.env.MONGODB_PASSWORD;
const appName = process.env.APP_NAME;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    `mongodb+srv://${appName}:${mongoPassword}@cluster0.oullp.mongodb.net/demoAppdbName`
  );
}

// Use routes
app.use("/", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});