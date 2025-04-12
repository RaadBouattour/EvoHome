const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }
});

module.exports = mongoose.model("VerificationCode", verificationCodeSchema);