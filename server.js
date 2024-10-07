const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js");
const scoreRoutes = require("./routes/scoreRoutes.js");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 12,
  message: "Too many requests from this IP, please try again after a minute",
});
app.use(limiter);

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRoutes);

app.listen(PORT, () => {
  console.log("Server is listening at " + PORT);
});
