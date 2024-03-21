const GameNotification = require('../models/gameNotificationModel');

async function findAllGameNotifications(paginate_options) {
    paginate_options.populate = [{path: 'game'}, {path: 'developer'}];
    paginate_options.sort = {creationDate: -1};
    return await GameNotification.paginate({}, paginate_options);
}

async function findGameNotificationById(gameNotification_id) {
    return await GameNotification.findById(gameNotification_id).populate('game').populate('developer').exec();
}

async function findGameNotificationByUserId(userid, paginate_options) {
    paginate_options.select = 'detail gameTitle game developer creationDate'
    paginate_options.populate = [{path: 'game'}, {path: 'developer'}];
    paginate_options.sort = {creationDate: -1};
    const query = { subscribers: userid };
    return await GameNotification.paginate(query, paginate_options);
}

async function createNewGameNotification(developer_info, game_info) {
    const gameNotification_doc = new GameNotification({
        detail: `${developer_info.username} made changes to their game!`,
        gameTitle: game_info.name,
        subscribers: game_info.wishlistedUsers,
        game: game_info._id,
        developer: developer_info.userid,
        creationDate: new Date()
    });

    return await gameNotification_doc.save();
}

async function updateGameNotificationById(gameNotification_id, update_user) {
    const update_query = { $pull: { subscribers: update_user }};
    return await GameNotification.findOneAndUpdate({ _id: gameNotification_id }, update_query, { new: true });
}

async function deleteGameNotificationById(gameNotification_id) {
    return await GameNotification.deleteOne({ _id: gameNotification_id });
}

async function deleteGameNotificationByGameId(game_id) {
    return await GameNotification.deleteMany({ game: game_id });
}

module.exports = {
    findAllGameNotifications,
    findGameNotificationById,
    findGameNotificationByUserId,
    createNewGameNotification,
    updateGameNotificationById,
    deleteGameNotificationById,
    deleteGameNotificationByGameId
}