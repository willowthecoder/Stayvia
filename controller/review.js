const listing = require("../models/listings.js");
const Review = require("../models/review.js");

//posting review
module.exports.postreview = async (req, res) => {
  const { id } = req.params;
  let list = await listing.findById(id);
  let newreview = new Review({
    comment: req.body.comment,
    rating: req.body.rating,
  });

  newreview.author = req.user._id;
  console.log(newreview);
  list.reviews.push(newreview);
  await newreview.save();
  await list.save();
  req.flash("success", "review added");

  res.redirect(`/listings/${list._id}`);
};

//deleting reviews
module.exports.deletereviews = async (req, res) => {
  let { id, reviewid } = req.params;
  await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findByIdAndDelete(reviewid);
  req.flash("success", "review deleted");

  res.redirect(`/listings/${id}`);
};
