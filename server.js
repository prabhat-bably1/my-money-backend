const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Secret (IMPORTANT: change in production)
const SECRET = "supersecretkey";

// ✅ Dummy Admin (hashed password: admin123)
const admins = [
  {
    username: "admin",
    password: "admin123"
  }
];

// ✅ In-memory data (later MongoDB use kar sakte ho)
let data = [];

// =========================
// 🔐 LOGIN ROUTE
// =========================
app.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Username & password required" });
    }

    const admin = admins.find((a) => a.username === username);
    if (!admin) {
      return res.status(404).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ msg: "Wrong password" });
    }

    const token = jwt.sign({ admin: true }, SECRET, { expiresIn: "2h" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// =========================
// 🔒 AUTH MIDDLEWARE
// =========================
function auth(req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(403).json({ msg: "No token" });
    }

    jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(403).json({ msg: "Invalid token" });
  }
}

// =========================
// 📥 GET DATA
// =========================
app.get("/data", auth, (req, res) => {
  res.json(data);
});

// =========================
// ➕ ADD DATA
// =========================
app.post("/add", auth, (req, res) => {
  const item = req.body;

  if (!item || Object.keys(item).length === 0) {
    return res.status(400).json({ msg: "No data provided" });
  }

  item.id = Date.now(); // unique id
  data.push(item);

  res.json({ msg: "Added", data: item });
});

// =========================
// ❌ DELETE ALL DATA
// =========================
app.delete("/deleteAll", auth, (req, res) => {
  data = [];
  res.json({ msg: "All data deleted" });
});

// =========================
// ❌ DELETE SINGLE ITEM
// =========================
app.delete("/delete/:id", auth, (req, res) => {
  const id = parseInt(req.params.id);

  data = data.filter((item) => item.id !== id);

  res.json({ msg: "Item deleted" });
});

// =========================
// ❤️ HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("My Money Backend Running 🚀");
});

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
