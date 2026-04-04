const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://prabhatrseth4_db_user:Sradha17@cluster0.kr1tylj.mongodb.net/mymoney?retryWrites=true&w=majority");
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});

const DataSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  type: String,
  category: String,
  note: String,
  date: String
});

const User = mongoose.model("User", UserSchema);
const Data = mongoose.model("Data", DataSchema);

// 🔐 Signup
app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send("User created");
});

// 🔐 Login
app.post("/login", async (req, res) => {
  const user = await User.findOne(req.body);
  if (!user) return res.send("Invalid");

  const token = jwt.sign({ id: user._id }, "secret");
  res.json({ token });
});

// ➕ Add Data
app.post("/add", async (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "secret");

  const item = new Data({ ...req.body, userId: decoded.id });
  await item.save();

  res.send("Added");
});

// 📊 Get Data
app.get("/data", async (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "secret");

  const data = await Data.find({ userId: decoded.id });
  res.json(data);
});

app.listen(3000, () => console.log("Server running"));
