const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose"); // for user authentication

//by default passport gives username and password
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});
userSchema.plugin(passportLocalMongoose); // for user authentication
module.exports = mongoose.model("User", userSchema);
