const { Router } = require("express");
const { validationResult } = require("express-validator/check");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const courses = await Course.find().populate("userId", "email name");
    res.render("courses", {
      title: "Courses",
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render("course", {
      layout: "empty",
      title: `Course ${course.title}`,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id/edit", auth, async (req, res, next) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  try {
    const course = await Course.findById(req.params.id);

    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    res.render("courseEdit", {
      title: `Update ${course.title}`,
      course,
    });
  } catch (error) {
    console.log(errors);
  }
});

router.post("/edit", auth, courseValidators, async (req, res, next) => {
  try {
    const { id } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
    }

    delete req.body.id;
    const course = await Course.findById(id);

    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    Object.assign(course, req.body);
    await course.save();
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

router.post("/remove", auth, courseValidators, async (req, res, next) => {
  try {
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

module.exports = router;
