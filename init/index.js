// This is a code which is used for development of the app . Please do not delete
//It deletes old datas and feeds new sample  data to our Project
const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listings.js");

main()
  .then(() => {
    console.log("Connection succesful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Stayvia");
}
async function init() {
  await listing
    .deleteMany({})
    .then(() => {
      console.log("Successfully deleted all");
    })
    .catch((err) => {
      console.log("Error deleting");
    });
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6857830be2348394efb2d6cc",
  }));
  await listing
    .insertMany(initData.data)
    .then(() => {
      console.log("Successfully inserted");
    })
    .catch((err) => {
      console.log(err);
    });
}

init();
