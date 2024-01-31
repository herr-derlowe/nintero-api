const yup = require('yup');
const mongoose = require('mongoose');

let handleObjectIdSchema = yup.object({
    entity_id: yup.string().test({
        name: "valid-mongodb-id-entityid",
        message: "Invalid entity ObjectId",
        test: (value) => {
          return mongoose.Types.ObjectId.isValid(value);
        }
    }).required()
})

module.exports = {
    handleObjectIdSchema
}