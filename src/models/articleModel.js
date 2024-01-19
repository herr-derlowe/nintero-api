const mongoose = require('mongoose');

const articleModel = mongoose.Schema({
    title: String,
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    thumbnailURL: { type: String, default: 'https://placehold.co/600x400' },
    content: String,
    creationDate: Date,
    lastUpdateDate: Date
}, {id: false});

module.exports = mongoose.model('Article', articleModel);