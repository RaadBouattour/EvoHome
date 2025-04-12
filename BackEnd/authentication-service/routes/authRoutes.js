const express = require("express");
const passport = require("../services/auth0Service");
const { signUp, signIn, verifyEmail, socialAuth } = require("../controllers/authController");
const { requestPasswordReset, resetPassword } = require("../controllers/emailController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/verify", verifyEmail);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

router.get("/google", passport.authenticate("auth0", { scope: ["openid", "profile", "email"] }));
router.get("/facebook", passport.authenticate("auth0", { scope: ["openid", "profile", "email"] }));

router.get("/callback", passport.authenticate("auth0", { failureRedirect: "/" }), socialAuth);

router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("http://localhost:3000"));
});

module.exports = router;