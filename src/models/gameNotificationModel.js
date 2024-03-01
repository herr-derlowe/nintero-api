const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const gameNotificationModel = new mongoose.Schema({
    detail: String,
    gameTitle: String,
    subscribers: [{
        type: mongoose.Types.ObjectId, ref: 'User'
    }],
    game: { type: mongoose.Types.ObjectId, ref: 'Game' },
    developer: { type: mongoose.Types.ObjectId, ref: 'User' },
    creationDate: Date
}, {id: false});

gameNotificationModel.plugin(mongoosePaginate);

module.exports = mongoose.model('GameNotification', gameNotificationModel);