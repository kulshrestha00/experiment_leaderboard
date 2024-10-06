const express = require("express");
const User = require("../models/User");

const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middlewares/auth");

// Route to create a new user
router.post("/register", async (req, res) => {
  const { userId, password } = req.body;

  try {
    const newUser = new User({ userId, password });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser.userId });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error creating user", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Find the user by userId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // password verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = generateToken(userId);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in", details: error.message });
  }
});

module.exports = router;
