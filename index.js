const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const csrf = require("csurf");
const flash = require("connect-flash");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
require("dotenv").config({ path: path.join(__dirname, ".env") });
const homeRoutes = require("./routes/home");
const addCourseRoutes = require("./routes/addCourse");
const coursesRoutes = require("./routes/courses");
const cardRoutes = require("./routes/card");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const fileMiddleware = require("./middleware/file");
const errorHandler = require("./middleware/error");

const app = express();

const PORT = process.env.PORT || 3000;

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require("./utils/hbs-helpers"),
});

const store = new MongoStore({
  collection: "sessions",
  uri: process.env.MONGO_DB_URL,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(fileMiddleware.single("avatar"));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addCourseRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`Server was started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
