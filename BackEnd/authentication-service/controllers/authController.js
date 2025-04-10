const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../services/emailService");

exports.signUp = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      verified: false
    });

    await newUser.save();
    const emailToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    await sendVerificationEmail(email, emailToken);

    res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await User.findByIdAndUpdate(decoded.id, { verified: true });

    res.json({ message: "Email successfully verified!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};


exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { firstname: user.firstname, lastname: user.lastname, email: user.email, phone: user.phone } });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.socialAuth = async (req, res) => {
  const { token } = req.body;
  
  const decoded = jwt.decode(token);
  const { email, name } = decoded;

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ firstname: name, email, verified: true });
    await user.save();
  }

  const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.json({ token: authToken, user });
};
