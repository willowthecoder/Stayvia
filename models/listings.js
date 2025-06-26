const mongoose = require("mongoose");
const Review = require("./review.js"); // for adding reviews for an individual listing

const { Schema } = mongoose;
const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    filename: {
      type: String,
      default: "default-image",
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1746876269545-c23ecff55722?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1746876269545-c23ecff55722?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          : v,
    },
  },
  price: {
    type: Number,
    required: true,
    min: 500, // no negative prices
  },
  location: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: String,
    enum: ["trending", "mountain", "beach", "snow", "resort"],
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  await Review.deleteMany({ _id: { $in: listing.reviews } });
});

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;
