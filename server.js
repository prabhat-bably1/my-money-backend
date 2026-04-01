const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "mymoney123";

// ✅ MongoDB connect
mongoose.connect("YOUR_MONGODB_URL")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// ✅ USER MODEL
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String
});

// ✅ AUTH MIDDLEWARE
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
  const {name,email,password} = req.body;

  const exist = await User.findOne({email});
  if(exist) return res.json({error:"User exists"});

  await User.create({name,email,password});
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

// ✅ GET PROFILE
app.get("/profile", auth, async (req,res)=>{
  const user = await User.findById(req.userId);
  res.json(user);
});

// ✅ UPDATE PROFILE
app.put("/update-profile", auth, async (req,res)=>{
  const {name,email} = req.body;

  try{
    const user = await User.findByIdAndUpdate(
      req.userId,
      {name,email},
      {new:true}
    );

    res.json({message:"Profile updated", user});
  }catch{
    res.json({error:"Update failed"});
  }
});

// ✅ START
app.listen(10000, ()=>console.log("Server running"));
