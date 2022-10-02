const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please provide email address!"],
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Please provide password!"],
      validate: {
        validator: (value) => validator.isStrongPassword(value),
        message:
          "A password must be of 8 characters long and it should contain number, uppercase and lowercase character, special character",
      },
    },
    firstname: {
      type: String,
      trim: true,
      required: [true, "Please provide your first name."],
      maxlength: [30, "First name must have less or equal then 30 characters"],
      validate: {
        validator: (value) => validator.isAlpha(value),
        message: "First name should contain only alphabets",
      },
    },
    lastname: {
      type: String,
      trim: true,
      required: [true, "Please provide your last name."],
      maxlength: [30, "Last Name must have less or equal then 30 characters"],
      validate: {
        validator: (value) => validator.isAlpha(value),
        message: "Last name should contain only alphabets",
      },
    },
    admincode: { type: String },
    isAdmin: { type: Boolean, default: false },
    isProf: { type: Boolean, default: false },
    profile: { type: Buffer },
    area_interest: { type: Array },
  },
  { collection: "users" }
);

const model = mongoose.model("UserSchema", UserSchema);

module.exports = model;
