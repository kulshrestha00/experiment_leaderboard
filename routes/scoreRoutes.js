const express = require("express");
const Score = require("../models/Score");
const router = express.Router();
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middlewares/auth.js");
require("dotenv").config();

// POST /scores request for score subbmitions
router.post("/createScore", authenticateToken, async (req, res) => {
  const { userId, score } = req.body;

  // Validate the request body
  if (typeof userId !== "string" || typeof score !== "number") {
    return res.status(400).send({ error: "Invalid userId or score" });
  }

  try {
    // Check if the userId exists in the User collection
    const userExists = await User.findOne({ userId });
    if (!userExists) {
      return res.status(404).send({ error: "User not found" });
    }

    // Update the score for the specified userId
    await Score.findOneAndUpdate({ userId }, { score }, { upsert: true });
    res.status(200).send({ message: "Score submitted successfully" });
  } catch (err) {
    res.status(500).send({
      error: "An error occurred while submitting score",
      details: err.message,
    });
  }
});

// GET  Retrieve and sort all scores
router.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    // sorting the data while fetching
    const scores = await Score.find().sort({ score: -1 });

    // Formating the response to include rank
    const leaderboard = scores.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      score: entry.score,
    }));

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).send({
      error: "An error occurred while retrieving the leaderboard",
      details: err.message,
    });
  }
});

module.exports = router;
