const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = async (to, token) => {
  const link = `http://localhost:4000/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your account",
    html: `<p>Click <a href="${link}">here</a> to verify your account.</p>`
  });
};

exports.sendResetPasswordEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔁 Reset Your Password",
    html: `
      <p>Your verification code is: <strong>${code}</strong></p>
    `
  });
};