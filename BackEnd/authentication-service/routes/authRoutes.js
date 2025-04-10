const express = require("express");
const { signUp, signIn } = require("../controllers/authController");
const passport = require("../services/auth0Service");
const router = express.Router();

router.get("/google", passport.authenticate("auth0", {
    scope: ["openid", "profile", "email"]
  }));
  
  router.get("/facebook", passport.authenticate("auth0", {
    scope: ["openid", "profile", "email"]
  }));
  
  router.get("/callback",
    passport.authenticate("auth0", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/dashboard"); 
    }
  );
  
  router.get("/logout", (req, res) => {
    req.logout(() => {
      res.redirect("http://localhost:3000");  
    });
  });
router.post("/signup", signUp);
router.post("/signin", signIn);
module.exports = router;