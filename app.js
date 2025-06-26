if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
//requirement the packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listings.js");
const Review = require("./models/review.js");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const path = require("path");
const { listingSchema, reviewSchema } = require("./Schema.js");
const listingsRoute = require("./routes/listing.js");
const reviewsRoute = require("./routes/review.js");
const userroute = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const atlasdb_url = process.env.ATLASDB_URL;
const sessionSecret = process.env.SESSION_SECRET;

//some unused packages
// const axios = require("axios");
// const cheerio = require("cheerio");
// const { resolveMx } = require("dns");
// const wrapAsync = require("./utils/wrapAsync.js");
// const ExpressError = require("./utils/expressError.js");
// const { error } = require("console");

//mongoose initialization

main()
  .then(() => {
    console.log("Connection succesful");
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(atlasdb_url);
}

// const storage = MongoStore.create({
//   mongoUrl: atlasdb_url,
//   crypto: {
//     secret: sessionSecret,
//   },
//   touchAfter: 24 * 3600, // time period in seconds
// });

// const sessionoptions = {
//   storage,
//   secret: sessionSecret,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     expires: Date.now() + 3 * 24 * 60 * 60 * 1000,
//     maxAge: 3 * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//   },
// };
//definations of packages
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "public")));

//initializing session and flash
app.use(session(sessionoptions));
app.use(flash());

//passport authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//port number
const port = 8080;

// app.use((req, res, next) => {
//   console.log(`Request: ${req.method} ${req.originalUrl}`);
//   next();
// });

//listening
app.listen(port, () => {
  console.log("App is listening on", port);
});

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
//listing routes
app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", userroute);

app.get("/", (req, res) => {
  res.send("Landing page");
});

app.get("/registerUser", async (req, res) => {
  let fakeUser = new User({
    email: "willow@gmail.com",
    username: "willow777",
  });
  let newUser = await User.register(fakeUser, "namasteduniya");
  res.send(newUser);
});

app.use((err, req, res, next) => {
  let { status = 500, message = "Some error occurred" } = err;
  console.log("Error occurred:", { status, message, path: req.originalUrl });
  res.status(status).render("./listings/error.ejs", { err });
});
