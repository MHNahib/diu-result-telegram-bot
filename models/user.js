const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  telegramId: {
    type: Number,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  searched: {
    type: Array,
  },
});

const User = new mongoose.model("User", userSchema);

module.exports.User = User;
