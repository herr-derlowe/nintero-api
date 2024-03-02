const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const articleNotificationModel = new mongoose.Schema({
    detail: String,
    articleTitle: String,
    subscribers: [{
        type: mongoose.Types.ObjectId, ref: 'User'
    }],
    article: { type: mongoose.Types.ObjectId, ref: 'Article' },
    developer: { type: mongoose.Types.ObjectId, ref: 'User' },
    creationDate: Date
}, {id: false});

articleNotificationModel.plugin(mongoosePaginate);

module.exports = mongoose.model('ArticleNotification', articleNotificationModel);