const mongoose = require("mongoose");

const User = mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
}, { timestamps: true }));

const Feedback = mongoose.model("Feedback", new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: true }));

const Registration = mongoose.model("Registration", new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
}, { timestamps: true }));

module.exports = { User, Feedback, Registration };
