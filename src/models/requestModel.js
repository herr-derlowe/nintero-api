const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const requestModel = mongoose.Schema({
  //requestUser: { type: mongoose.Types.ObjectId, ref: 'User' },
  requestUser: { type: mongoose.Types.ObjectId, ref: "User" },
  requestDate: Date,
  state: Boolean,
});

requestModel.plugin(mongoosePaginate);

module.exports = mongoose.model("request", requestModel);
