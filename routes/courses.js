const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = Router();

router.get("/", async (req, res, next) => {
  const courses = await Course.find().populate('userId', "email name");
  res.render("courses", {
    title: "Courses",
    isCourses: true,
    courses,
  });
});

router.get("/:id", async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  res.render("course", {
    layout: "empty",
    title: `Course ${course.title}`,
    course,
  });
});

router.get("/:id/edit", auth, async (req, res, next) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  const course = await Course.findById(req.params.id);

  res.render("courseEdit", {
    title: `Update ${course.title}`,
    course,
  });
});

router.post("/edit", auth, async (req, res, next) => {
  const { id } = req.body;
  delete req.body.id;
  await Course.findByIdAndUpdate(id, req.body);
  res.redirect("/courses");
});

router.post("/remove", auth, async (req, res, next) => {
  try {
    await Course.deleteOne({ _id: req.body.id });
    res.redirect('/courses')
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
