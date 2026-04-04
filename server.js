const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB
mongoose.connect("mongodb+srv://prabhatrseth4_db_user:Sradha17@cluster0.kr1tylj.mongodb.net/mymoney?retryWrites=true&w=majority")
.then(()=>console.log("DB Connected"))
.catch(err=>console.log(err));

// ✅ Models
const User = mongoose.model("User", {
  email: String,
  password: String
});

const Data = mongoose.model("Data", {
  userId: String,
  amount: Number,
  type: String,
  category: String,
  note: String,
  date: String
});

// ✅ Signup
app.post("/signup", async (req,res)=>{
  await new User(req.body).save();
  res.send("Signup done");
});

// ✅ Login
app.post("/login", async (req,res)=>{
  const user = await User.findOne(req.body);
  if(!user) return res.send("Invalid");

  const token = jwt.sign({id:user._id}, "secret");
  res.json({token});
});

// ✅ Middleware
function auth(req,res,next){
  const token = req.headers.authorization;
  const decoded = jwt.verify(token,"secret");
  req.userId = decoded.id;
  next();
}

// ✅ Add
app.post("/add", auth, async (req,res)=>{
  await new Data({...req.body, userId:req.userId}).save();
  res.send("Added");
});

// ✅ Get
app.get("/data", auth, async (req,res)=>{
  const data = await Data.find({userId:req.userId});
  res.json(data);
});

// ✅ PORT FIX
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", ()=>console.log("Server running"));
