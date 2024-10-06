const mongoose = require("mongoose");

//Create the user Schema for mongo
const scoreSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
});

const Score = mongoose.model("Score", scoreSchema);

module.exports = Score;
