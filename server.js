require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ===== Razorpay Setup =====
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// ===== Dummy DB (replace later with MongoDB) =====
let users = [];

// ===== Signup =====
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  users.push({ email, password: hashed });

  res.json({ success: true, message: "User created" });
});

// ===== Login =====
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET);

  res.json({ success: true, token });
});

// ===== Create Order =====
app.post("/create-order", async (req, res) => {
  const options = {
    amount: 9900,
    currency: "INR",
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

// ===== Verify Payment =====
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expected === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.listen(PORT, () => console.log("Server running"));
