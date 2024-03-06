const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const receiptModel = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    game: { type: mongoose.Types.ObjectId, ref: 'Game' },
    creationDate: Date
}, {id: false});

receiptModel.plugin(mongoosePaginate);

module.exports = mongoose.model('Receipt', receiptModel);