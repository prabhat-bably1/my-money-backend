const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "adminsecret";

// Dummy DB (later MongoDB laga sakte ho)
let users = [{username:"admin"}];
let data = [];

// 🔐 Admin Login
app.post("/admin-login", (req,res)=>{
    const {username,password} = req.body;

    if(username==="admin" && password==="1234"){
        const token = jwt.sign({admin:true}, SECRET);
        res.json({token});
    } else {
        res.status(401).json({msg:"Invalid"});
    }
});

// 🔐 Middleware
function auth(req,res,next){
    const token = req.headers.authorization;
    try{
        jwt.verify(token, SECRET);
        next();
    }catch{
        res.status(403).json({msg:"Unauthorized"});
    }
}

// 📊 Get Users
app.get("/users", auth, (req,res)=>{
    res.json(users);
});

// 📊 Get Transactions
app.get("/data", auth, (req,res)=>{
    res.json(data);
});

// ➕ Add Data
app.post("/add", (req,res)=>{
    data.push(req.body);
    res.json({msg:"added"});
});

// ❌ Delete All
app.delete("/deleteAll", auth, (req,res)=>{
    data=[];
    res.json({msg:"deleted"});
});

app.listen(5000, ()=>console.log("Server running"));
