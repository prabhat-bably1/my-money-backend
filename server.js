const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose.connect("mongodb+srv://prabhatrseth4_db_user:Sradha17@cluster0.kr1tylj.mongodb.net/mymoney?retryWrites=true&w=majority");

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
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User created" });
  } catch {
    res.json({ message: "Error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne(req.body);

  if (!user) {
    return res.json({ message: "User not found" });
  }

  res.json({ user });
});

// Add Transaction
app.post("/add", async (req, res) => {
  try {
    const t = new Transaction(req.body);
    await t.save();
    res.json({ message: "Added" });
  } catch {
    res.json({ message: "Error" });
  }
});

// Balance
app.get("/balance/:userId", async (req, res) => {
  const data = await Transaction.find({ userId: req.params.userId });

  let balance = 0;

  data.forEach(t => {
    if (t.type === "income") balance += t.amount;
    else balance -= t.amount;
  });

  res.json({ balance });
});

app.listen(5000, () => console.log("Server running"));
