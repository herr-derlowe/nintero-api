const Game = require('../models/gameModel');

async function findAllGames(paginate_options) {
    paginate_options.populate = [{path: 'developer'}, {path: 'category'}];
    paginate_options.sort = {publishDate: -1};
    return await Game.paginate({}, paginate_options);
}

async function findAllGamesByDownloads(amount) {
    // paginate_options.populate = [{path: 'developer'}, {path: 'category'}];
    // paginate_options.sort = {downloads: -1};
    // paginate_options.limit = 
    // return await Game.paginate({}, paginate_options);
    return await Game.find().populate('developer').populate('category').sort({downloads: -1}).limit(amount).exec();
}

async function findAllGamesByCreationDateDESC(amount) {
    // paginate_options.populate = [{path: 'developer'}, {path: 'category'}];
    // paginate_options.sort = {downloads: -1};
    // paginate_options.limit = 
    // return await Game.paginate({}, paginate_options);
    return await Game.find().populate('developer').populate('category').sort({publishDate: -1}).limit(amount).exec();
}

async function findGameById(game_id) {
    return await Game.findById(game_id).populate('developer').populate('category').exec();
}

async function findGamesWithFilters(filter_options, paginate_options) {
    let filter_query = {};
    paginate_options.populate = [{path: 'developer'}, {path: 'category'}];
    //paginate_options.sort = {creationDate: -1};

    if ('downloads' in filter_options) {
        switch (filter_options.downloads) {
            case 'ASCD':
                paginate_options.sort = {downloads: 1};
                break;
            case 'DESC':
                paginate_options.sort = {downloads: -1};
                break;
        }
    } else {
        paginate_options.sort = {creationDate: -1};
    }

    if ('name' in filter_options) {
        filter_query.name = { $regex: filter_options.name, $options: 'i' };
    }

    if ('category' in filter_options) {
        filter_query.category = { $in: filter_options.category }
    }

    if ('developer' in filter_options) {
        // console.log(article_filter_obj.author);
        filter_query.developer = filter_options.developer;
    }

    if ('price' in filter_options) {
        filter_query.price = { $lte: filter_options.price }
    }

    return await Game.paginate(filter_query, paginate_options);
}

async function findGamesByIdArray(id_array){
    let search_query = { $in: id_array};
    return await User.find({ _id: search_query }).populate('developer').populate('category').exec();
}

async function createNewGame(game_detail, developer_id) {
    const game_doc = new Game({
        name: game_detail.name,
        about: game_detail.about,
        developer: developer_id,
        category: game_detail.category,
        thumbnailURL: game_detail.thumbnailURL,
        gameImages: game_detail.gameImages,
        price: game_detail.price,
        minreq: game_detail.minreq,
        recreq: game_detail.recreq,
        blocked: false,
        downloads: 0,
        wishlistedUsers: [],
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
    findAllGamesByDownloads,
    findAllGamesByCreationDateDESC,
    findGameById,
    findGamesWithFilters,
    findGamesByIdArray,
    createNewGame,
    deleteGameById,
    updateGameById
}