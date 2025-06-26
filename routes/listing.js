const express = require("express");
const router = express.Router();
const listing = require("../models/listings.js");
const ExpressError = require("../utils/expressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../Schema.js");
const { isloggedIn } = require("../middleware.js");
//const { isOwner } = require("../middleware.js");
const listingcontroller = require("../controller/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//joi validation
let validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    return next(new ExpressError(400, errMsg));
  } else {
    next();
  }
};
// for / route
// .post(isloggedIn, validateListing, wrapAsync(listingcontroller.postlist));
router
  .route("/")
  .get(wrapAsync(listingcontroller.index))
  .post(
    validateListing,
    isloggedIn,
    upload.single("image"),
    listingcontroller.postlist
  );

//new route
router.get("/new", isloggedIn, listingcontroller.newlist);

//for /:id route
router
  .route("/:id")
  .get(wrapAsync(listingcontroller.displaylist))
  .put(
    isloggedIn,
    upload.single("image"),
    wrapAsync(listingcontroller.updatelist2)
  )
  .delete(isloggedIn, wrapAsync(listingcontroller.destroylist));

//update get route
router.get("/:id/edit", isloggedIn, wrapAsync(listingcontroller.updatelist));

module.exports = router;
