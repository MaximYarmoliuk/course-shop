const { Router } = require("express");
const User = require("../models/user");
const router = Router();

router.get("/login", async (req, res, next) => {
  res.render("auth/login", {
    title: "Login",
    isLogin: true,
  });
});

router.get("/logout", async (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/auth/login#login");
  });
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = password === candidate.password;

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
        res.redirect("/auth/login#login");
      }
    } else {
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, repeat } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      res.redirect("/auth/login#register");
    } else {
      const user = new User({
        email,
        name,
        password,
        cart: {
          items: [],
        },
      });
      await user.save();
      res.redirect("/auth/login#login");
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
