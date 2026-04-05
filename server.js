const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "supersecretkey";

// 🔥 Dummy DB (later MongoDB use kar sakte ho)
let admins = [
  {
    username: "admin",
    password: "$2b$10$Wqk8YJ7Xk8xYy6yP6WZyXuVtC9Z0Wz6P8c8hRZyKzJxV0Z1vXyY7K" // hashed Admin@12345
  }
];

let data = [];

// 🔐 LOGIN
app.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;

  const admin = admins.find(a => a.username === username);
  if (!admin) return res.status(401).json({ msg: "User not found" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ msg: "Wrong password" });

  const token = jwt.sign({ admin: true }, SECRET, { expiresIn: "2h" });

  res.json({ token });
});

// 🔐 AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(403).json({ msg: "No token" });

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ msg: "Invalid token" });
  }
}

// 📊 GET DATA
app.get("/data", auth, (req, res) => {
  res.json(data);
});

// ➕ ADD DATA
app.post("/add", auth, (req, res) => {
  data.push(req.body);
  res.json({ msg: "Added" });
});

// ❌ DELETE ALL
app.delete("/deleteAll", auth, (req, res) => {
  data = [];
  res.json({ msg: "Deleted" });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));
