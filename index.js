const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const app = express();

// app.use(fileUpload());
app.use(express.json());

// config cloudinary
cloudinary.config({
  cloud_name: "dg2uamnxa", 
  api_key: "792612549899165",
  api_secret: "DvENEaVtjEf4bfMe4gPzNNluHxk",
});

mongoose.connect("mongodb://localhost:27017/auth-vinted");

const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer")

app.use("/user", userRoutes);
app.use(offerRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Auth API" });
});

app.all(/.*/, (req, res) => {
  return res.status(404).json("All routes")
})

app.listen(3000, () => {
  console.log("Server started 🚀");
});
