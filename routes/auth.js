const { Router } = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");
const sgMail = require("@sendgrid/mail");
const User = require("../models/user");
const registrationEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const { registerValidators, loginValidators } = require("../utils/validators");
const router = Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/login", async (req, res, next) => {
  res.render("auth/login", {
    title: "Login",
    isLogin: true,
    loginError: req.flash("loginError"),
    registerError: req.flash("registerError"),
  });
});

router.get("/logout", async (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.get("/password/:token", async (req, res, next) => {
  if (req.param.token) {
    return res.redirect("/auth/login");
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect("/auth/login");
    } else {
      res.render("auth/password", {
        title: "Regain access",
        error: req.flash("error"),
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", loginValidators, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("loginError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#login");
    }

    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);

      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          }
          res.redirect("/");
        });
      } else {
        req.flash("loginError", "Password is incorrect");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("loginError", "User not found");
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", registerValidators, async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("registerError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPassword,
      cart: {
        items: [],
      },
    });
    await user.save();
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send(registrationEmail(email));
    res.redirect("/auth/login#login");
  } catch (error) {
    console.log(error);
  }
});

router.get("/reset", (req, res, next) => {
  res.render("auth/reset", {
    title: "Forgot password?",
    error: req.flash("error"),
  });
});

router.post("/reset", (req, res, next) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", " Something was wrong");
        res.redirect("/auth/reset");
      }

      const token = buffer.toString("hex");
      const candidate = await User.findOne({ email: req.body.email });

      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send(resetEmail(candidate.email, token));
        res.redirect("/auth/login#login");
      } else {
        req.flash("error", "Email not found");
        res.redirect("/auth/reset");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/password", async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect("/auth/login");
    } else {
      req.flash("loginError", "Token lifetime expired");
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
