const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("YOUR_MONGO_URL")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

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
app.post("/signup", async (req,res)=>{
  await User.create(req.body);
  res.json({message:"Signup success"});
});

// Login
app.post("/login", async (req,res)=>{
  const user = await User.findOne(req.body);

  if(user){
    res.json({success:true, userId:user._id});
  } else {
    res.json({success:false});
  }
});

// Add
app.post("/add", async (req,res)=>{
  await Transaction.create(req.body);
  res.json({message:"Added"});
});

// Get all
app.post("/get", async (req,res)=>{
  const data = await Transaction.find({userId:req.body.userId});
  res.json(data);
});

// Delete
app.post("/delete", async (req,res)=>{
  await Transaction.findByIdAndDelete(req.body.id);
  res.json({message:"Deleted"});
});

// Balance
app.post("/balance", async (req,res)=>{
  const data = await Transaction.find({userId:req.body.userId});

  let balance = 0;

  data.forEach(t=>{
    if(t.type==="income") balance += t.amount;
    else balance -= t.amount;
  });

  res.json({balance});
});

app.get("/",(req,res)=>res.send("API Running"));

app.listen(10000,()=>console.log("Server running"));
