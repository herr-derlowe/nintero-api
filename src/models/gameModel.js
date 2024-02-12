const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

function getPrice(value) {
    if (typeof value !== 'undefined') {
       return parseFloat(value.toString());
    }
    return value;
};

const gameModel = new mongoose.Schema({
    name: String,
    developer: { type: mongoose.Types.ObjectId, ref: 'User' },
    category: [{
        type: mongoose.Types.ObjectId, ref: 'categories'
    }],
    thumbnailURL: { type: String, default: 'https://placehold.co/600x400' },
    gameImages: {
        type: [String],
        default: ['https://placehold.co/600x400', 'https://placehold.co/600x400', 'https://placehold.co/600x400']
    },
    price: {
        type: mongoose.Types.Decimal128,
        default: 1,
        get: getPrice
    },
    minreq: {
        os: String,
        processor: String,
        memory: String,
        graphics: String,
        directx: String,
        storage: String,
        notes: String
    },
    recreq: {
        os: String,
        processor: String,
        memory: String,
        graphics: String,
        directx: String,
        storage: String,
        notes: String
    },
    blocked: {
        type: Boolean,
        default: false
    },
    downloads: {
        type: Number,
        default: 0
    },
    publishDate: Date,
    updateDate: Date
}, { id: false, toJSON: { getters: true}});

gameModel.plugin(mongoosePaginate);

module.exports = mongoose.model('Game', gameModel);