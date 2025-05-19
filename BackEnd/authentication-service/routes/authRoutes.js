const express = require("express");
const passport = require("../services/auth0Service");
const { signUp, signIn, verifyEmail, socialAuth, verifyResetCode, updateUserInfo, updateEmailWithPassword, getProfile } = require("../controllers/authController");
const { requestPasswordReset, resetPassword } = require("../controllers/emailController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/verify", verifyEmail);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post('/verify-code', verifyResetCode);

router.get("/google", passport.authenticate("auth0", { scope: ["openid", "profile", "email"] }));
router.get("/facebook", passport.authenticate("auth0", { scope: ["openid", "profile", "email"] }));

router.put("/info", authMiddleware, updateUserInfo);
router.put("/email", authMiddleware, updateEmailWithPassword);
router.get("/me", authMiddleware, getProfile);

router.get("/callback", passport.authenticate("auth0", { failureRedirect: "/" }), socialAuth);

router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("http://localhost:3000"));
});

module.exports = router;