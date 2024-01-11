const Categories = require("../models/categoriesModel");
const mongo = require("mongodb");

async function findAllCategories() {
  return await Categories.find().exec();
}

async function findUCategoryById(categoryid) {
  return await Categories.findById(categoryid).exec();
}

async function findByName(nombre) {
  let query = { nombre: nombre };
  const result = await Categories.findOne(query).exec();

  return result;
}

async function createCategory(userbody) {
  const categoryDoc = new Categories({
    nombre: userbody.nombre,
    fechaCreacion: new Date(),
  });
  return await categoryDoc.save();
}

async function updateCategory(categoryid, update_data) {
  let query = {
    $set: update_data,
  };

  return await Categories.findOneAndUpdate({ _id: categoryid }, query, {
    new: true,
  });
}

async function deleteCategory(categoryid) {
  return await Categories.deleteOne({ _id: categoryid });
}

module.exports = {
  findAllCategories,
  findUCategoryById,
  findByName,
  createCategory,
  updateCategory,
  deleteCategory,
};
