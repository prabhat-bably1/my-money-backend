require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 💰 Create Order API
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ✅ Verify Payment API (IMPORTANT SECURITY)
app.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({
        success: true,
        message: "Payment verified ✅",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid signature ❌",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 🌐 PORT (Render compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected 🔥"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/payment", require("./routes/payment"));

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running ${PORT}`));
