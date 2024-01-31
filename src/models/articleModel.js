const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const articleModel = new mongoose.Schema({
    title: String,
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    thumbnailURL: { type: String, default: 'https://placehold.co/600x400' },
    content: String,
    creationDate: Date,
    lastUpdateDate: Date
}, {id: false});

articleModel.plugin(mongoosePaginate);

module.exports = mongoose.model('Article', articleModel);