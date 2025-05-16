const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

const app = express();

// app.use(fileUpload()); Middleware global désactivé, on vient le mettre directement dans les routes concernées
app.use(express.json());

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
