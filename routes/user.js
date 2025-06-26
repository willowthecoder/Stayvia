const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const local = require("passport-local");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//for /signup route
router
  .route("/signup")
  .get((req, res) => {
    res.render("./users/signup.ejs");
  })
  .post(
    wrapAsync(async (req, res) => {
      try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err, next) => {
          if (err) {
            next(err);
          }
          req.flash(
            "success",
            "Welcome to StayVia , User registered successfully"
          );
          res.redirect("/listings");
        });
      } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
      }
    })
  );

//for /login path
router
  .route("/login")
  .get((req, res) => {
    res.render("./users/login.ejs");
  })
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    async (req, res) => {
      req.flash("success", "Login successful , welcome Back");
      const redirect = res.locals.redirectUrl || "/listings";
      res.redirect(redirect);
    }
  );

//for /logout path
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out");
    res.redirect("/listings");
  });
});

module.exports = router;
