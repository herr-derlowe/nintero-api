const yup = require('yup');
const mongoose = require('mongoose');

const SORT_MODE_REGEX = /(ASCD|DESC)/

let technical_requirements = yup.object({
    os: yup.string().required(),
    processor: yup.string().required(),
    memory: yup.string().required(),
    graphics: yup.string().required(),
    directx: yup.string().required(),
    storage: yup.string().required(),
    notes: yup.string()
}).noUnknown(true).strict();

let createGameSchema = yup.object({
    name: yup.string().required(),
    // developer is handled automatically
    category: yup.array().of(yup.string().test(
        {
            name: "valid-mongodb-id-category",
            message: "Invalid 'CATEGORY' ID in 'category'",
            test: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            }
        })
    ).min(1).required(),
    thumbnailURL: yup.string().url(),
    gameImages: yup.array().of(yup.string().url()).min(1).required(),
    // publishDate is handled automatically
    // updateDate is handled automatically
    price: yup.number().min(0).required(),
    minreq: technical_requirements.required(),
    recreq: technical_requirements.required()
    // blocked is handled automatically
    // downloads is handled automatically
});

let updateGameSchema = yup.object({
    name: yup.string(),
    category: yup.array().of(yup.string().test(
        {
            name: "valid-mongodb-id-category",
            message: "Invalid 'CATEGORY' ID in 'category'",
            test: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            }
        })
    ).min(1),
    thumbnailURL: yup.string().url(),
    gameImages: yup.array().of(yup.string().url()).min(1),
    // updateDate is handled automatically
    price: yup.number().min(0),
    minreq: technical_requirements,
    recreq: technical_requirements
}).required().noUnknown(true).strict();

let updateAdminGameSchema = yup.object({
    name: yup.string(),
    developer: yup.string(),
    category: yup.array().of(yup.string().test(
        {
            name: "valid-mongodb-id-category",
            message: "Invalid 'CATEGORY' ID in 'category'",
            test: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            }
        })
    ).min(1),
    thumbnailURL: yup.string().url(),
    gameImages: yup.array().of(yup.string().url()).min(1),
    price: yup.number().min(0),
    minreq: technical_requirements,
    recreq: technical_requirements,
    blocked: yup.bool(),
    downloads: yup.number().integer().min(0)
}).required().noUnknown(true).strict();

let filterGameSchema = yup.object({
    name: yup.string(),
    category: yup.array().of(yup.string().test(
        {
            name: "valid-mongodb-id-category",
            message: "Invalid 'CATEGORY' ID in 'category'",
            test: (value) => {
                return mongoose.Types.ObjectId.isValid(value);
            }
        })
    ).min(1),
    developer: yup.string(),
    downloads: yup.string().uppercase().matches(SORT_MODE_REGEX, 
        'Downloads sort mode must be either ASCD for ascending order or DESC for descending'),
    price: yup.number().min(0)
}).required().noUnknown(true).strict();

module.exports = {
    createGameSchema,
    updateGameSchema,
    updateAdminGameSchema,
    filterGameSchema
};