const User = require('../models/userModel');
const Game = require('../models/gameModel');
const Receipt = require('../models/receiptModel');

async function findAllReceipts(paginate_options) {
    paginate_options.populate = [{path: 'user'}, {path: 'game'}];
    paginate_options.sort = {creationDate: -1};
    return await Receipt.paginate({}, paginate_options);
}

async function findUserReceipts(userid, paginate_options) {
    paginate_options.populate = [{path: 'user'}, {path: 'game'}];
    paginate_options.sort = {creationDate: -1};

    return await Receipt.paginate({ user: userid}, paginate_options);
}

async function findReceiptById(receiptid) {
    return await Receipt.findById(receiptid).populate('user').populate('game').exec();
}

async function createReceipt(userid, gameid){
    const receipt_doc = new Receipt({
        user: userid,
        game: gameid,
        creationDate: new Date()
    });

    return await receipt_doc.save();
}

async function deleteReceipt(receiptid) {
    return await Receipt.deleteOne({ _id: receiptid });
}

module.exports = {
    findAllReceipts,
    findUserReceipts,
    findReceiptById,
    createReceipt,
    deleteReceipt
}