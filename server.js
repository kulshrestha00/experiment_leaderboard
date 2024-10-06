const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js");
const scoreRoutes = require("./routes/scoreRoutes.js");
const authenticateToken = require("./middlewares/auth.js");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRoutes);

app.listen(PORT, () => {
  console.log("Server is listening at " + PORT);
});
