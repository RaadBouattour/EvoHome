const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const VerificationCode = require("../models/VerificationCode");
const { sendResetPasswordEmail } = require("../services/emailService");

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const code = generateCode();
  await VerificationCode.create({ userId: user._id, code });
  await sendResetPasswordEmail(email, code);
  res.json({ message: "Verification code sent" });
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const validCode = await VerificationCode.findOne({ userId: user._id, code });
  if (!validCode) return res.status(400).json({ message: "Invalid or expired code" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  await VerificationCode.deleteMany({ userId: user._id });

  res.json({ message: "Password reset successfully" });
};

exports.sendVerificationEmail = async (to, token) => {
  const link = `http://localhost:4000/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "✔️ Email Verification",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>
          <p>Thank you for registering!</p>
          <p>
            👉 <a href="${link}" target="_blank" style="color: #1a73e8;">Click here to verify your account</a>
          </p>
          <p>If the link doesn't work, copy and paste this URL into your browser:</p>
          <p><a href="${link}" target="_blank">${link}</a></p>
        </body>
      </html>
    `
  });
};

