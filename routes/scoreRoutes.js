const express = require("express");
const Score = require("../models/Score");
const router = express.Router();
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middlewares/auth.js");
require("dotenv").config();
const { getCachedData, setCachedData } = require("../services/redisService.js");

// adding bulk users
router.post("/bulkCreateScores", authenticateToken, async (req, res) => {
  const users = req.body; //should be array of object/json

  //if not array return error with msg
  if (
    !Array.isArray(users) ||
    users.some((user) => !user.userId || typeof user.score !== "number")
  ) {
    return res.status(400).send({
      error:
        "Invalid request format. Each object must have a valid userId and score.",
    });
  }

  try {
    //manupulating data for updating field
    const bulkOperations = users.map((user) => ({
      updateOne: {
        filter: { userId: user.userId },
        update: { score: user.score },
        upsert: true, // if not available it will add one
      },
    }));

    const bulkResult = await Score.bulkWrite(bulkOperations);

    //sending the completation msg back how many entris updated and added
    res.status(201).send({
      message: "Scores created/updated successfully",
      scoreUpdates: bulkResult.nModified,
      scoreInserts: bulkResult.upsertedCount,
    });
  } catch (err) {
    res.status(500).send({
      error: "An error occurred during bulk score creation",
      details: err.message,
    });
  }
});

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
    const { userId } = req.body; // Expecting userId in the request body

    // Check if the user exists
    const userExists = await User.findOne({ userId });
    if (!userExists) {
      return res.status(404).send({ error: "User not found" });
    }
    const cacheKey = "leaderboard";

    // Check if data is cached in Redis
    const cachedLeaderboard = await getCachedData(cacheKey);
    if (cachedLeaderboard) {
      return res.status(200).json(cachedLeaderboard);
    }

    // If not cached, fetch from MongoDB
    const leaderboard = await Score.find().sort({ score: -1 }).lean();
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      score: entry.score,
    }));

    // Cache the result in Redis
    await setCachedData(cacheKey, formattedLeaderboard);

    // Return leaderboard from MongoDB
    res.status(200).json(formattedLeaderboard);
  } catch (err) {
    res
      .status(500)
      .send({ error: "An error occurred while retrieving the leaderboard" });
  }
});

module.exports = router;
