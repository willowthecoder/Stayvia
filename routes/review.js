const express = require("express");
const router = express.Router({ mergeParams: true });
const listing = require("../models/listings.js");
const ExpressError = require("../utils/expressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../Schema.js");
const Review = require("../models/review.js");
const { isloggedIn } = require("../middleware.js");

const reviewcontroller = require("../controller/review.js");
//joi validation for reviews
let validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    return next(new ExpressError(400, errMsg));
  } else {
    next();
  }
};
//posting review
router.post(
  "/",
  validateReview,
  isloggedIn,
  wrapAsync(reviewcontroller.postreview)
);

// for reviews - delete
router.delete(
  "/:reviewid",
  isloggedIn,
  wrapAsync(reviewcontroller.deletereviews)
);

module.exports = router;
