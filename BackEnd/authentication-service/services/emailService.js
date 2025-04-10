const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = async (userEmail, token) => {
  const verificationLink = `http://localhost:4000/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"EvoHome" <no-reply@smarthome.com>',
    to: userEmail,
    subject: "Email Verification",
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
  });
};

exports.sendResetPasswordEmail = async (userEmail, resetToken) => {
  const resetLink = `http://localhost:4000/api/auth/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: '"Smart Home App" <no-reply@smarthome.com>',
    to: userEmail,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  });
};
