const { body } = require("express-validator/check");
const User = require("../models/user");

exports.registerValidators = [
  body("email")
    .isEmail()
    .withMessage("Please, enter correct email address")
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("Email is already in use");
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  body("password", "Password must be at least 6 characters")
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body("confirm")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must be equal");
      }
      return true;
    })
    .trim(),
  body("name")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .trim(),
];

exports.loginValidators = [
  body("email")
    .isEmail()
    .withMessage("Please, enter correct email address")
    .normalizeEmail(),
  body("password", "Password must be at least 6 characters")
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
];

exports.courseValidators = [
  body("title")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters")
    .trim(),
  body("price").isNumeric().withMessage("Please, enter correct price"),
  body("img", "Please, enter correct url address").isURL(),
];
