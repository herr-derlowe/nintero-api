const yup = require('yup');
const mongoose = require('mongoose');

let registerArticleSchema = yup.object({
    title: yup.string().required(),
    // author is handled automatically
    thumbnailURL: yup.string().url(),
    content: yup.string().required()
});

// let filterArticleSchema = yup.object({
//     title: yup.string(),
//     lte: yup.date(),
//     gte: yup.date()
// });

let filterArticleSchema = yup.object({
    title: yup.string(),
    lte: yup.date(),
    gte: yup.date(),
    author: yup.string()
}).required().noUnknown(true).strict();

let udpateArticleSchema = yup.object({
    title: yup.string(),
    thumbnailURL: yup.string().url(),
    content: yup.string(),
}).required().noUnknown(true).strict();;

let updateArticleAdminSchema = yup.object({
    title: yup.string(),
    thumbnailURL: yup.string().url(),
    content: yup.string(),
    author: yup.string(),
    creationDate: yup.date(),
    lastUpdateDate: yup.date()
}).required().noUnknown(true).strict();

module.exports = {
    registerArticleSchema,
    filterArticleSchema,
    udpateArticleSchema,
    updateArticleAdminSchema
}