const ArticleNotification = require('../models/articleNotificationModel');

async function findAllArticleNotifications(paginate_options) {
    paginate_options.populate = [{path: 'article'}, {path: 'developer'}];
    paginate_options.sort = {creationDate: -1};
    return await ArticleNotification.paginate({}, paginate_options);
}

async function findArticleNotificationById(articleNotification_id) {
    return await ArticleNotification.findById(articleNotification_id).populate('article').populate('developer').exec();
}

async function findArticleNotificationByUserId(userid, paginate_options) {
    paginate_options.select = 'detail articleTitle article developer creationDate'
    paginate_options.populate = [{path: 'article'}, {path: 'developer'}];
    paginate_options.sort = {creationDate: -1};
    const query = { subscribers: userid };
    return await ArticleNotification.paginate(query, paginate_options);
}

async function createNewArticleNotification(developer_info, article_info, subscribers_array) {
    const articleNotification_doc = new ArticleNotification({
        detail: `${developer_info.username} published a new article!`,
        articleTitle: article_info.title,
        subscribers: /*developer_info.followers*/subscribers_array,
        article: article_info._id,
        developer: developer_info.userid,
        creationDate: new Date()
    });

    return await articleNotification_doc.save();
}

async function updateArticleNotificationById(articleNotification_id, update_user) {
    const update_query = { $pull: { subscribers: update_user }};
    return await ArticleNotification.findOneAndUpdate({ _id: articleNotification_id }, update_query, { new: true });
}

async function deleteArticleNotificationById(articleNotification_id) {
    return await ArticleNotification.deleteOne({ _id: articleNotification_id });
}

module.exports = {
    findAllArticleNotifications,
    findArticleNotificationById,
    findArticleNotificationByUserId,
    createNewArticleNotification,
    updateArticleNotificationById,
    deleteArticleNotificationById
}