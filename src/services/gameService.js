const Game = require('../models/gameModel');

async function findAllGames(paginate_options) {
    paginate_options.populate = [{path: 'developer'}, {path: 'category'}];
    paginate_options.sort = {publishDate: -1};
    return await Game.paginate({}, paginate_options);
}

async function findGameById(game_id) {
    return await Game.findById(game_id).populate('developer').populate('category').exec();
}

// TODO: findGameByTitle
// TODO: findGameWithFilters

async function createNewGame(game_detail, developer_id) {
    const game_doc = new Game({
        name: game_detail.name,
        developer: developer_id,
        category: game_detail.category,
        thumbnailURL: game_detail.thumbnailURL,
        gameImages: game_detail.gameImages,
        price: game_detail.price,
        minreq: game_detail.minreq,
        recreq: game_detail.recreq,
        blocked: false,
        downloads: 0,
        publishDate: new Date(),
        updateDate: new Date()
    });

    return await game_doc.save();
}

async function deleteGameById(game_id) {
    return await Game.deleteOne({ _id: game_id });
}

async function updateGameById(game_id, update_data) {
    update_data.updateDate = new Date();
    let update_query = { $set: update_data};
    return await Game.findOneAndUpdate({ _id: game_id }, update_query, { new: true });
}

module.exports = {
    findAllGames,
    findGameById,
    createNewGame,
    deleteGameById,
    updateGameById
}