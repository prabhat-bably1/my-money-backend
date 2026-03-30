const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "mymoney123";

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// ✅ MongoDB (APNA URL DAALO)
mongoose.connect("YOUR_MONGODB_URL")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// ✅ MODELS
const User = mongoose.model("User", {
  email: String,
  password: String
});

const Transaction = mongoose.model("Transaction", {
  userId: String,
  type: String,
  amount: Number,
  category: String,
  note: String
});

// ✅ AUTH
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

// ✅ SIGNUP
app.post("/signup", async (req,res)=>{
  const {email,password} = req.body;

  const exist = await User.findOne({email});
  if(exist) return res.json({error:"User exists"});

  await User.create({email,password});
  res.json({message:"Signup success"});
});

// ✅ LOGIN
app.post("/login", async (req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.json({error:"User not found"});

  if(user.password !== password)
    return res.json({error:"Wrong password"});

  const token = jwt.sign({id:user._id}, SECRET);
  res.json({token});
});

// ✅ ADD
app.post("/add", auth, async (req,res)=>{
  await Transaction.create({
    userId:req.userId,
    ...req.body
  });
  res.json({message:"Added"});
});

// ✅ GET DATA
app.get("/transactions", auth, async (req,res)=>{
  const data = await Transaction.find({userId:req.userId});
  res.json(data);
});

// ✅ BALANCE
app.get("/balance", auth, async (req,res)=>{
  const data = await Transaction.find({userId:req.userId});
  let balance = 0;

  data.forEach(t=>{
    if(t.type==="income") balance += t.amount;
    else balance -= t.amount;
  });

  res.json({balance});
});

// ✅ START
app.listen(10000, ()=>console.log("Server running"));
