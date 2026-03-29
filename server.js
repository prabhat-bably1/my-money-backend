const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("My Money Backend Running 🚀");
});

const SECRET = "mymoney123";

// MongoDB
mongoose.connect("mongodb+srv://prabhatrseth4_db_user:Sradha17@cluster0.kr1tylj.mongodb.net/mymoney?retryWrites=true&w=majority")
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

// Middleware
function auth(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.json({error:"No token"});

  try{
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  }catch{
    res.json({error:"Invalid token"});
  }
}

// Signup
app.post("/signup", async (req,res)=>{
  const {email,password} = req.body;

  const exist = await User.findOne({email});
  if(exist) return res.json({error:"User exists"});

  await User.create({email,password});
  res.json({message:"Signup success"});
});

// Login
app.post("/login", async (req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({ email });

if(!user || user.password !== password){
  return res.json({error:"Invalid login"});
}

  const token = jwt.sign({id:user._id}, SECRET);
  res.json({token});
});

// Add
app.post("/add", auth, async (req,res)=>{
  await Transaction.create({
    userId:req.userId,
    ...req.body
  });

  res.json({message:"Added"});
});

// Get all
app.get("/transactions", auth, async (req,res)=>{
  const data = await Transaction.find({userId:req.userId});
  res.json(data);
});

// Balance
app.get("/balance", auth, async (req,res)=>{
  const data = await Transaction.find({userId:req.userId});

  let balance = 0;
  data.forEach(t=>{
    if(t.type==="income") balance += t.amount;
    else balance -= t.amount;
  });

  res.json({balance});
});

// ADMIN USERS
app.get("/admin/users", async (req,res)=>{
  const adminKey = req.headers.adminkey;

  if(adminKey !== "12345"){
    return res.status(403).json({error:"Unauthorized"});
  }

  const users = await User.find().select("-password");
  res.json(users);
});

// ADMIN TRANSACTIONS
app.get("/admin/transactions", async (req,res)=>{
  const adminKey = req.headers.adminkey;

  if(adminKey !== "12345"){
    return res.status(403).json({error:"Unauthorized"});
  }

  const data = await Transaction.find();
  res.json(data);
});

app.listen(10000, ()=>console.log("Server running"));
