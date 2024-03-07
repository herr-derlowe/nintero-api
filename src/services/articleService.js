const Article = require('../models/articleModel');

async function findAllArticles(paginate_options) {
    paginate_options.populate = 'author';
    paginate_options.sort = {creationDate: -1};
    return await Article.paginate({}, paginate_options);
    // return await Article.find().populate('author').sort({ creationDate: -1 }).exec();
}

async function findAllArticlesByCreationDateDESC(amount) {
    // paginate_options.populate = [{path: 'developer'}, {path: 'category'}];
    // paginate_options.sort = {downloads: -1};
    // paginate_options.limit = 
    // return await Game.paginate({}, paginate_options);
    return await Article.find().populate('author').sort({creationDate: -1}).limit(amount).exec();
}

/**
 * @description DB single article service. Expects article ObjectId and returns promise containing article document
*/
async function findArticleById(article_id) {
    return await Article.findById(article_id).populate('author').exec();
}

async function findArticleByTitle(article_title_query, paginate_options) {
    paginate_options.populate = 'author';
    paginate_options.sort = {creationDate: -1};
    const query = { title: { $regex: article_title_query, $options: 'i' } };
    return await Article.paginate(query, paginate_options);
    //return await Article.find(query).populate('author').sort({ creationDate: -1 }).exec();
}

async function findArticleWithFilters(article_filter_obj, paginate_options, article_title_query) {
    let filter_query = {};
    paginate_options.populate = 'author';
    paginate_options.sort = {creationDate: -1};

    if (article_title_query) {
        filter_query.title = { $regex: article_title_query, $options: 'i' };
    }

    if (article_filter_obj.author) {
        // console.log(article_filter_obj.author);
        filter_query.author = article_filter_obj.author;
    }

    if (article_filter_obj.gte) {
        let lt_filter = new Date(article_filter_obj.lte);
        filter_query.creationDate = { 
            $gte: new Date(article_filter_obj.gte), 
            $lt: lt_filter.setDate(lt_filter.getDate() + 1)
        };
    }
    return await Article.paginate(filter_query, paginate_options);
    //return await Article.find(filter_query).populate('author').sort({ creationDate: -1 }).exec();
}

async function createNewArticle(article_body, author_id) {
    const article_doc = new Article({
        title: article_body.title,
        author: author_id,
        thumbnailURL: article_body.thumbnailURL,
        content: article_body.content,
        creationDate: new Date(),
        lastUpdateDate: new Date()
    });

    return await article_doc.save();
}

async function deleteArticleById(article_id) {
    return await Article.deleteOne({ _id: article_id });
}

async function updateArticleById(article_id, update_data) {
    update_data.lastUpdateDate = new Date();
    let update_query = { $set: update_data};
    return await Article.findOneAndUpdate({ _id: article_id }, update_query, { new: true });
}

module.exports = {
    findAllArticles,
    findAllArticlesByCreationDateDESC,
    findArticleById,
    findArticleByTitle,
    findArticleWithFilters,
    createNewArticle,
    deleteArticleById,
    updateArticleById
}