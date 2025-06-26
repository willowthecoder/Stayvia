const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  image: Joi.string().uri(),
  price: Joi.number().min(500).required(),
  location: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
});

module.exports.reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().required(),
});
