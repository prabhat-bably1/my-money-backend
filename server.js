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
app.post("/signup", async (req,res)=>{
  const {email,password} = req.body;

  const hashed = await bcrypt.hash(password,10);

  await User.create({email,password:hashed});

  res.json({success:true});
});

app.post("/login", async (req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.status(400).json({error:"User not found"});

  const valid = await bcrypt.compare(password,user.password);
  if(!valid) return res.status(400).json({error:"Wrong password"});

  const token = jwt.sign({id:user._id},process.env.JWT_SECRET);

  res.json({token,isPro:user.isPro});
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
