require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
// const fileUpload = require("express-fileupload");

const app = express();

// app.use(fileUpload());
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer")
const paymentRoutes = require("./routes/payment");

app.use("/user", userRoutes);
app.use(offerRoutes);
app.use("/payment",paymentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Auth API" });
});

app.all(/.*/, (req, res) => {
  return res.status(404).json("All routes")
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server started 👕👖 on port " + port);
});
