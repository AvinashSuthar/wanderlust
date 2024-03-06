const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {
  saveRedirectUrl
} = require("../middleware");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res) => {
  try {
    let {
      username,
      password,
      email
    } = req.body;
    const user = new User({
      email,
      username
    });
    const register = await User.register(user, password);
    // console.log(register);
    req.login(register, (err) => {
      if (err) {
        return next(err);
      } else {
        req.flash("success", "Welcome to WanderLust");
        res.redirect("/listing");
      }
    })

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}))


router.get("/login", (req, res) => {
  res.render("users/login.ejs");
})

router.post("/login", saveRedirectUrl, passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), async (req, res) => {
  req.flash("success", "Welcome to Wanderlust");
  let redirectUrl = res.locals.redirectUrl || "/listing";
  // console.log(redirectUrl);
  // console.log(res.locals.redirectUrl)
  res.redirect(redirectUrl);
})


router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/listing")
  })
})

module.exports = router;