const yup = require("yup");

let categorySchema = yup.object({
    nombre: yup.string().required(),
  }).required();

module.exports = {
  categorySchema,
};
