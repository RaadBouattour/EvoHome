const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("./services/auth0Service"); // ✅ Corrigé

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require("./routes/authRoutes"); // idem ici : pas besoin de /src
app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Database Connection Error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
