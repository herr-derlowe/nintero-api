const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const categoriesModel = new mongoose.Schema({
  nombre: String,
  fechaCreacion: Date,
}, { id: false });

categoriesModel.plugin(mongoosePaginate);

module.exports = mongoose.model("categories", categoriesModel);
