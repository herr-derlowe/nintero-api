const express= require('express');
const router = express.Router();
const articleSchema = require('../verifiers/articleschemas');
const globalSchema = require('../verifiers/globalschemas');
const articleService = require('../services/articleService');
const userService = require('../services/userService');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

router.get('/', (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    articleService.findAllArticles(paginate_options).then((documents) => {
        return res.status(200).json(documents);
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get articles',
            error: error
        });
    });
});

router.get('/:articleid', (req, res, next) => {
    const article_id = req.params.articleid;

    articleService.findArticleById(article_id).then((document) => {
        if (document) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "That article does not exist"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get that article',
            error: error
        });
    });
});

router.get('/search/:query', (req, res, next) => {
    const article_query = req.params.query;
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    articleService.findArticleByTitle(article_query, paginate_options).then((document) => {
        if (document.length !== 0) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "Couldn't find an article with that query"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get an article',
            error: error
        });
    });
});

router.post('/search/:query/filter', (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    try {
        const filters_body = {
            lte: new Date(req.body.lte),
            gte: new Date(req.body.gte),
            author: req.body.author
        }
        //console.log(req.body);
        console.log(req.params.query);
        if (filters_body.author) {
            articleSchema.filterArticleSchemaWithAuthor.validateSync(filters_body, {abortEarly: false});
        } else {
            articleSchema.filterArticleSchema.validateSync(filters_body, {abortEarly: false});
        }
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        } else {
            return res.status(422).json({
                error: e.message
            });
        }
    }

    articleService.findArticleWithFilters(req.body, paginate_options, req.params.query).then((document) => {
        if (document.length !== 0) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "Couldn't find an article with that query"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get an article',
            error: error
        });
    });
});

router.post('/filter', (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    try {
        const filters_body = {
            lte: new Date(req.body.lte),
            gte: new Date(req.body.gte),
            author: req.body.author
        }
        //console.log(req.body);
        if (filters_body.author) {
            articleSchema.filterArticleSchemaWithAuthor.validateSync(filters_body, {abortEarly: false});
        } else {
            articleSchema.filterArticleSchema.validateSync(filters_body, {abortEarly: false});
        }
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        } else {
            return res.status(422).json({
                error: e.message
            });
        }
    }

    articleService.findArticleWithFilters(req.body, paginate_options).then((document) => {
        if (document.length !== 0) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "Couldn't find an article with that query"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get an article',
            error: error
        });
    });
});

router.post('/create', tokenAuthentication, checkTipo([0, 1]), (req, res, next) => {
    const new_article = {
        title: req.body.title,
        thumbnailURL: req.body.thumbnailURL,
        content: req.body.content
    }

    try {
        //console.log(req.body);
        articleSchema.registerArticleSchema.validateSync(new_article, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {        
        articleService.createNewArticle(new_article, req.tokenData.userid).then((insert_result) =>{
            console.log(insert_result);
            if (insert_result) {
                return res.status(201).json({
                    message: 'New article created',
                    article: insert_result
                });
            } else {
                return res.status(422).json({
                    message: 'Could not create the user'
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not create the user',
            error: error.message
        });
    }
});

router.delete('/delete/:articleid', tokenAuthentication, checkTipo([0, 1]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.articleid
        }, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        const found_article = await articleService.findArticleById(req.params.articleid);
        if (found_article && req.tokenData.tipo == 1 && found_article.author._id != req.tokenData.userid) {
            return res.status(401).json({
                message: "You are not the author of that article"
            });
        } else if (found_article) {
            const deleted_count = await articleService.deleteArticleById(req.params.articleid);
            if (deleted_count.deletedCount !== 1) {
                return res.status(400).json({
                    message: 'Could not delete article by provided id'
                });
            } else {
                return res.status(200).json({
                    message: 'Article deleted',
                    deletedCount: deleted_count.deletedCount
                });
            }
        } else {
            return res.status(404).json({
                message: "That article does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not delete article',
            error: error
        });
    }
});

router.put('/update/:articleid', tokenAuthentication, checkTipo([1]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.articleid
        }, {abortEarly: false});

        articleSchema.udpateArticleSchema.validateSync(req.body, { abortEarly: false });
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        const found_article = await articleService.findArticleById(req.params.articleid);

        if (found_article && found_article.author._id != req.tokenData.userid) {
            return res.status(401).json({
                message: "You are not the author of that article"
            });
        } else if (found_article) {
            articleService.updateArticleById(req.params.articleid, req.body).then((updated_document) => {
                if (!updated_document) {
                    return res.status(400).json({
                        message: "Article update empty"
                    });
                } else {
                    return res.status(200).json({
                        message: "Article updated successfully",
                        article: updated_document
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                return res.status(400).json({
                    message: "Article update failed",
                    error: error
                });
            });
        } else {
            return res.status(404).json({
                message: "That article does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not update article',
            error: error
        });
    }
});

router.put('/admin/update/:articleid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        if ('creationDate' in req.body) {
            req.body.creationDate = new Date(req.body.creationDate);
        }

        if ('lastUpdateDate' in req.body) {
            req.body.lastUpdateDate = new Date(req.body.lastUpdateDate);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not convert date fields",
            error: error.message
        }); 
    }

    try {
        console.log(req.body);
        articleSchema.updateArticleAdminSchema.validateSync(req.body, {abortEarly: false});
        if ('author' in req.body) {
            globalSchema.handleObjectIdSchema.validateSync({
                entity_id: req.body.author
            }, {abortEarly: false});
        }
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        if ('author' in req.body) {
            const found_user = await userService.findUserById(req.body.author);
            if (found_user) {
                console.log(found_user);
            } else {
                return res.status(404).json({
                    message: "That author does not exist"
                });
            }
        }
    } catch (e) {
        console.log(error);
        return res.status(500).json({
            message: "Could not verify author",
            error: error.message
        }); 
    }

    try {
        const updated_document = await articleService.updateArticleById(req.params.articleid, req.body);
        if (updated_document) {
            return res.status(200).json({
                message: "Article updated successfully",
                article: updated_document
            });
        } else {
            return res.status(400).json({
                message: "Article update empty"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not update article',
            error: error.message
        });
    }
});

module.exports = router;