const axios = require("axios");
const listing = require("../models/listings");

//show all listings
module.exports.index = async (req, res) => {
  const { category, search } = req.query;
  let filter = {};
  if (category) {
    filter.category = category.toLowerCase();
  }
  if (search) {
    filter.$or = [
      { country: { $regex: search, $options: "i" } }, // case-insensitive match
      { location: { $regex: search, $options: "i" } },
    ];
  }
  const alllistings = await listing.find(filter);

  if (alllistings != null) {
    res.render("./listings/listings.ejs", { alllistings, category, search });
  } else {
    res.send("error showing listings");
  }
};

//new list
module.exports.newlist = (req, res) => {
  res.render("./listings/new.ejs");
};

//show route

module.exports.displaylist = async (req, res) => {
  let { id } = req.params;
  const list = await listing
    .findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (list != null) {
    res.render("./listings/showlist.ejs", { list });
    console.log(listing);
  } else {
    req.flash("error", "listing does'not exit");
    return res.redirect("/listings");
  }
};

//using wrapasync to post on the list
module.exports.postlist = async (req, res, next) => {
  let url1 = req.file.path;
  let filename = req.file.filename;
  let { title, description, price, location, country, category } = req.body;
  if (isNaN(price)) {
    return next(new ExpressError(400, "Invalid price"));
  }
  const geoResponse = await axios.get(
    "https://api.opencagedata.com/geocode/v1/json",
    {
      params: {
        q: `${location}, ${country}`,
        key: process.env.OPENCAGE_API_KEY,
      },
    }
  );

  if (!geoResponse.data.results.length) {
    return next(new ExpressError(400, "Invalid location: couldn't geocode."));
  }

  const coordinates = geoResponse.data.results[0].geometry;
  const lng = coordinates.lng;
  const lat = coordinates.lat;

  const imageFilename = "default-image";
  const newListing = new listing({
    title: title,
    description: description,
    price: price,
    location: location,
    country: country,
    category: category,
    image: {
      filename: filename,
      url: url1,
    },
    geometry: {
      type: "Point",
      coordinates: [lng, lat], // NOTE: [lng, lat] order!
    },
  });
  if (!newListing) {
    return next(new ExpressError(404, "Error saving in Database"));
  }
  newListing.owner = req.user._id;
  console.log("Form data:", req.body);
  await newListing
    .save()
    .then(() => {
      console.log("Listing successfully");
      console.log(newListing);
    })
    .catch((err) => {
      console.log(err);
    });
  req.flash("success", "listing added");
  res.redirect("/listings"); // or send a response back}
};

//update get route
module.exports.updatelist = async (req, res) => {
  let { id } = req.params;

  const list = await listing.findById(id);
  if (list != null) {
    let originalurlimg = list.image.url;
    let neworiginalurl = originalurlimg.replace(
      "/upload",
      "/upload/h_400,w_250"
    );
    res.render("./listings/edit.ejs", { list, neworiginalurl });
  } else {
    req.flash("error", "listing does'not exit");
    return res.redirect("/listings");
  }
};

//update put route
module.exports.updatelist2 = async (req, res) => {
  let { id } = req.params;

  const list = await listing.findById(id);
  if (!list) {
    return next(new ExpressError(400, "Error finding in Database"));
  }
  Object.assign(list, req.body);
  if (typeof req.file != "undefined") {
    let url1 = req.file.path;
    let filename = req.file.filename;
    list.image.filename = filename;
    list.image.url = url1;
  }

  const locationString = `${list.location}, ${list.country}`;
  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        locationString
      )}&key=${apiKey}`
    );

    const geoData = response.data;
    if (!geoData.results || geoData.results.length === 0) {
      return next(new ExpressError(400, "Failed to geocode updated location"));
    }

    const { lat, lng } = geoData.results[0].geometry;

    list.geometry = {
      type: "Point",
      coordinates: [lng, lat],
    };
  } catch (err) {
    return next(new ExpressError(500, "Error fetching location data"));
  }

  await list
    .save()
    .then(() => {
      console.log("Saved successfully");
    })
    .catch((err) => {
      console.log(err);
    });
  req.flash("success", "listing updated");

  res.redirect(`/listings/${id}`);
};

//delele route
module.exports.destroylist = async (req, res) => {
  let { id } = req.params;
  let deleted = await listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "listing deleted");
  res.redirect("/listings");
};
