const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "mymoneysecret";

// MongoDB
mongoose.connect("YOUR_MONGODB_URL");

// Models
const User = mongoose.model("User", {
  email: String,
  password: String
});

const Transaction = mongoose.model("Transaction", {
  userId: String,
  type: String,
  amount: Number,
  category: String
});

// Signup
app.post("/signup", async (req, res) => {
  await User.create(req.body);
  res.json({ message: "User created" });
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne(req.body);

  if (user) {
    const token = jwt.sign({ id: user._id }, SECRET);
    res.json({ success: true, token });
  } else {
    res.json({ success: false });
  }
});

// Add
app.post("/add", async (req, res) => {
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, SECRET);

    await Transaction.create({
      ...req.body,
      userId: decoded.id
    });

    res.json({ message: "Added" });
  } catch {
    res.json({ message: "Auth failed" });
  }
});

// Get Transactions
app.get("/transactions", async (req, res) => {
  const token = req.headers.authorization;

  const decoded = jwt.verify(token, SECRET);

  const data = await Transaction.find({ userId: decoded.id });

  res.json(data);
});

// Balance
app.get("/balance", async (req, res) => {
  const token = req.headers.authorization;

  const decoded = jwt.verify(token, SECRET);

  const data = await Transaction.find({ userId: decoded.id });

  let balance = 0;

  data.forEach(t => {
    if (t.type === "income") balance += t.amount;
    else balance -= t.amount;
  });

  res.json({ balance });
});

// Delete
app.delete("/delete/:id", async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(3000, () => console.log("Server running"));
