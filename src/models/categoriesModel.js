const mongoose = require("mongoose");

const categoriesModel = new mongoose.Schema({
  nombre: String,
  fechaCreacion: Date,
}, { id: false });

module.exports = mongoose.model("categories", categoriesModel);
