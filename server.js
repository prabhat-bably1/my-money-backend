const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const SECRET = "mymoney";

// 🔗 MongoDB
mongoose.connect("mongodb+srv://prabhatrseth4_db_user:Sradha17@cluster0.kr1tylj.mongodb.net/mymoney?retryWrites=true&w=majority")
.then(()=>console.log("DB Connected"));

// USER MODEL
const User = mongoose.model("User", {
  name:String,
  email:String,
  password:String
});

// DATA MODEL
const Data = mongoose.model("Data", {
  userId:String,
  amount:Number,
  type:String,
  category:String,   // 🔥 NEW
  note:String,       // 🔥 NEW
  date:String
});

// AUTH
function auth(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.send("No token");

  const decoded = jwt.verify(token, SECRET);
  req.userId = decoded.id;
  next();
}

// SIGNUP
app.post("/signup", async(req,res)=>{
  const {name,email,password} = req.body;

  const exist = await User.findOne({email});
  if(exist) return res.json({error:"User exists"});

  await User.create({name,email,password});
  res.json({msg:"Signup success"});
});

// LOGIN
app.post("/login", async(req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.json({error:"No user"});

  if(user.password !== password)
    return res.json({error:"Wrong password"});

  const token = jwt.sign({id:user._id}, SECRET);
  res.json({token});
});

// ADD DATA
app.post("/add", auth, async(req,res)=>{
  const {amount,type,category,note,date} = req.body;

  await Data.create({
  userId:req.userId,
  amount,
  type,
  category,
  note,
  date
});

  res.json({msg:"Added"});
});

// GET DATA
app.get("/data", auth, async(req,res)=>{
  const data = await Data.find({userId:req.userId});
  res.json(data);
});

// START
app.listen(10000, ()=>console.log("Server running"));
