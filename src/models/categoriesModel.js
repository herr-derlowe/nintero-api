const mongoose = require("mongoose");

const categoriesModel = mongoose.Schema({
  nombre: String,
  fechaCreacion: Date,
});

module.exports = mongoose.model("categories", categoriesModel);
