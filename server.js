const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "mymoney123";

// ✅ ADMIN LOGIN DETAILS
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASS = "123456";

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// ✅ MongoDB (APNA URL DAALO)
mongoose.connect("mongodb+srv://prabhatrseth4_db_user:Sradha17@cluster0.kr1tylj.mongodb.net/mymoney?retryWrites=true&w=majority")
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

// ✅ ADMIN PROTECT
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.json({ error: "No token" });

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.json({ error: "Invalid admin token" });
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

// ✅ ADMIN LOGIN
app.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    const token = jwt.sign({ admin: true }, SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid admin login" });
  }
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

// ✅ ADMIN: GET USERS
app.get("/admin/users", verifyAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ ADMIN: GET ALL TRANSACTIONS
app.get("/admin/transactions", verifyAdmin, async (req, res) => {
  const tx = await Transaction.find();
  res.json(tx);
});

// ✅ ADMIN: DELETE SINGLE TRANSACTION
app.delete("/admin/delete/:id", verifyAdmin, async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ✅ ADMIN: DELETE ALL
app.delete("/admin/delete-all", verifyAdmin, async (req, res) => {
  await Transaction.deleteMany({});
  res.json({ message: "All deleted" });
});

// ✅ DELETE USER (ADMIN)
app.delete("/admin/delete-user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // user delete
    await User.findByIdAndDelete(id);

    // uske transactions bhi delete
    await Transaction.deleteMany({ userId: id });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.json({ error: "Delete failed" });
  }
});

// ✅ START
app.use(express.static("public"));
app.listen(10000, ()=>console.log("Server running"));
