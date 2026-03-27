const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: String,
  type: String,
  amount: Number,
  category: String
});

module.exports = mongoose.model("Transaction", TransactionSchema);
