require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= DB ================= */
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  isPro: { type: Boolean, default: false }
});

const User = mongoose.model("User", UserSchema);

/* ================= Razorpay ================= */
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});

/* ================= Auth ================= */
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed
    });

    res.json({ success: true });

  } catch (err) {
    console.log("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/login", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("USER:", user);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log("VALID:", valid);

    if (!valid) {
      return res.status(400).json({ error: "Wrong password" });
    }

    // 🔥 SAFE JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret"
    );

    res.json({ success: true, token });

  } catch (err) {
    console.log("🔥 LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
/* ================= Razorpay ================= */
app.get("/get-key",(req,res)=>{
  res.json({key:process.env.KEY_ID});
});

app.post("/create-order", async (req,res)=>{
  const order = await razorpay.orders.create({
    amount: 9900,
    currency: "INR"
  });

  res.json(order);
});

app.post("/verify-payment", async (req,res)=>{
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body)
    .digest("hex");

  if(expected === razorpay_signature){
    // Upgrade user to PRO
    // (real app me user identify karo via token)
    await User.updateOne({}, { isPro: true });

    res.json({success:true});
  } else {
    res.status(400).json({error:"Payment Failed"});
  }
});
app.get("/", (req, res) => {
  res.send("My Money API Running 🚀");
});
app.listen(process.env.PORT || 5000, ()=>{
  console.log("Server running");
});
