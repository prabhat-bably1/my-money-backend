const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// Add Transaction
router.post("/", async (req, res) => {
  try {
    const { userId, type, amount, category } = req.body;

    const t = new Transaction({ userId, type, amount, category });
    await t.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Transaction error" });
  }
});

module.exports = router;
