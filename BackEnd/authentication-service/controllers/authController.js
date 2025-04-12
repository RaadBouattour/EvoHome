const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendVerificationEmail } = require("../services/emailService");


exports.signUp = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Génère un token contenant les infos (mais pas encore en DB)
    const token = jwt.sign(
      { firstname, lastname, email, password: hashedPassword },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Envoie le mail
    await sendVerificationEmail(email, token);

    res.status(200).json({ message: "📩 Please check your email to verify your account" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user });
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Décode le token (email + hash inclus)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { firstname, lastname, email, password } = decoded;

    // Check si déjà existant (double clic ?)
    const exists = await User.findOne({ email });
    if (exists) return res.send("⛔ Account already verified.");

    // Crée le user maintenant
    await User.create({
      firstname,
      lastname,
      email,
      password,
      isVerified: true
    });

    res.send("✅ Email verified and account created successfully!");
  } catch (err) {
    console.error(err);
    res.status(400).send("❌ Invalid or expired token");
  }
};

exports.socialAuth = async (req, res) => {
  const { email, name } = req.user;
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ firstname: name, email });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.redirect(`http://localhost:3000/social-auth?token=${token}`);
};
