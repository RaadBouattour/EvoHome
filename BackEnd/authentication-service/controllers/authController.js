const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendVerificationEmail } = require("../services/emailService");
const VerificationCode = require("../models/VerificationCode");

// ✅ SIGN UP
exports.signUp = async (req, res) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    console.log("🟢 Received signup data:", req.body);

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const userRole = role === "admin" ? "admin" : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const tokenPayload = {
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: userRole,
    };

    console.log("🟡 tokenPayload before jwt.sign:", tokenPayload);

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("🟠 Generated token:", token);

    await sendVerificationEmail(email, token);
    res.sendStatus(201);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ EMAIL VERIFICATION
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔵 Decoded token in verifyEmail:", decoded);

    const { firstname, lastname, email, password, role } = decoded;

    const exists = await User.findOne({ email });
    if (exists) return res.send("Account already verified.");

    console.log("🟣 Creating user with role:", role);

    await User.create({
      firstname,
      lastname,
      email,
      password,
      role: role || "user",
      isVerified: true,
    });

    res.send("Email verified and account created successfully!");
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(400).send("Invalid or expired token");
  }
};

// ✅ SIGN IN
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const tokenPayload = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
    };

    console.log("🧾 Signing in with payload:", tokenPayload);

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Sign in error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// ✅ UPDATE INFO
exports.updateUserInfo = async (req, res) => {
  const { firstname, lastname } = req.body;
  try {
    const updates = {};
    if (firstname) updates.firstname = firstname;
    if (lastname) updates.lastname = lastname;

    await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.status(200).json({ message: "User information updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Error updating user information" });
  }
};

// ✅ UPDATE EMAIL WITH PASSWORD VERIFICATION
exports.updateEmailWithPassword = async (req, res) => {
  const { oldEmail, newEmail, password } = req.body;

  try {
    const user = await User.findOne({ email: oldEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const existing = await User.findOne({ email: newEmail });
    if (existing && existing.id !== user.id) {
      return res.status(409).json({ message: "New email is already in use" });
    }

    user.email = newEmail;
    await user.save();

    res.json({ message: "Email updated successfully" });
  } catch (err) {
    console.error("Email update error:", err);
    res.status(500).json({ message: "Error updating email" });
  }
};

// ✅ SOCIAL AUTH
exports.socialAuth = async (req, res) => {
  const { email, name } = req.user;
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ firstname: name, email });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.redirect(`http://localhost:3000/social-auth?token=${token}`);
};

// ✅ RESET CODE VERIFICATION
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const validCode = await VerificationCode.findOne({
      userId: user._id,
      code,
    });
    if (!validCode)
      return res.status(400).json({ message: "Invalid or expired code" });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
