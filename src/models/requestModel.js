const mongoose = require("mongoose");

const requestModel = mongoose.Schema({
  //requestUser: { type: mongoose.Types.ObjectId, ref: 'User' },
  requestUser: { type: mongoose.Types.ObjectId, ref: "User" },
  requestDate: Date,
  state: Boolean,
});

module.exports = mongoose.model("request", requestModel);
