const express = require("express");
const router = express.Router();

const User = require("../models/User");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const cloudinary = require("../config/cloudinary");
const convertToBase64 = require("../utils/convertToBase64");

// Sign up
router.post("/signup", fileUpload(), async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const salt = uid2(24);
    const token = uid2(32);
    const hash = SHA256(password + salt).toString(encBase64);

    let avatar = null;
    console.log("DEBUG - req.files:", req.files);
    if (req.files?.avatar) {
      const convertedAvatar = convertToBase64(req.files.avatar);
      const avatarUpload = await cloudinary.uploader.upload(convertedAvatar, {
        folder: "vinted/avatars",
      });
      avatar = avatarUpload;
    }

    const newUser = new User({
      email,
      account: { 
        username,
        avatar,
       },
      newsletter,
      token,
      hash,
      salt,
    });

    await newUser.save();


    res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.account.username,
        avatar: newUser.account.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const newHash = SHA256(password + foundUser.salt).toString(encBase64);

    if (newHash === foundUser.hash) {
      res.status(200).json({
        _id: foundUser._id,
        token: foundUser.token,
        account: { username: foundUser.account.username },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
