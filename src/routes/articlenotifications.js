const express= require('express');
const router = express.Router();
const globalSchema = require('../verifiers/globalschemas');
const articleNotificationService = require('../services/articleNotificationService');
const userService = require('../services/userService');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

router.get('/getall', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    articleNotificationService.findAllArticleNotifications(paginate_options).then((documents) => {
        return res.status(200).json(documents);
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get all article notifications',
            error: error
        });
    });
});

router.get('/get/bynotification/:notificationid', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    const articleNotification_id = req.params.notificationid;

    articleNotificationService.findArticleNotificationById(articleNotification_id).then((document) => {
        if (document) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "That article notification does not exist"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get that article notification',
            error: error
        });
    });
});

router.get('/get/byuser/:userid', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    const userid = req.params.userid;
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    articleNotificationService.findArticleNotificationByUserId(userid, paginate_options).then((document) => {
        if (document.length !== 0) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "Couldn't find any article notifications for that user"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get any article notifications',
            error: error
        });
    });
});

router.get('/get/byself', tokenAuthentication, checkTipo([0, 1, 2]), (req, res, next) => {
    const userid = req.tokenData.userid;
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    articleNotificationService.findArticleNotificationByUserId(userid, paginate_options).then((document) => {
        if (document.length !== 0) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "Couldn't find any article notifications for that user"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get any article notifications',
            error: error
        });
    });
});

router.put('/read/:notificationid', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.notificationid
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
        const found_articleNotification = await articleNotificationService.findArticleNotificationById(req.params.notificationid);

        if (found_articleNotification) {
            articleNotificationService.updateArticleNotificationById(req.params.notificationid, req.tokenData.userid).then(async (updated_document) => {
                if (!updated_document) {
                    return res.status(400).json({
                        message: "Article notification update empty"
                    });
                } else {
                    if (updated_document.subscribers.length === 0) {
                        const deleted_count = await articleNotificationService.deleteArticleNotificationById(req.params.notificationid);
                        console.log(`Article notification ${req.params.notificationid} deleted\nDeleted count (should be one): ${deleted_count.deletedCount}`);
                    }

                    return res.status(200).json({
                        message: "Article notification updated successfully",
                        notification: updated_document
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                return res.status(400).json({
                    message: "Article notification update failed",
                    error: error
                });
            });
        } else {
            return res.status(404).json({
                message: "That article notification does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not update article notification',
            error: error
        });
    }
});

router.put('/readuser/:notificationid/:userid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.notificationid
        }, {abortEarly: false});

        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.userid
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
        const found_articleNotification = await articleNotificationService.findArticleNotificationById(req.params.notificationid);
        const found_user = await userService.findUserById(req.params.userid);

        if (found_articleNotification && found_user) {
            articleNotificationService.updateArticleNotificationById(req.params.notificationid, req.params.userid).then( async (updated_document) => {
                if (!updated_document) {
                    return res.status(400).json({
                        message: "Article notification update empty"
                    });
                } else {
                    if (updated_document.subscribers.length === 0) {
                        const deleted_count = await articleNotificationService.deleteArticleNotificationById(req.params.notificationid);
                        console.log(`Article notification ${req.params.notificationid} deleted\nDeleted count (should be one): ${deleted_count.deletedCount}`);
                    }

                    return res.status(200).json({
                        message: "Article notification updated successfully",
                        article: updated_document
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                return res.status(400).json({
                    message: "Article notification update failed",
                    error: error
                });
            });
        } else {
            return res.status(404).json({
                message: "That article notification or user does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not update article notification',
            error: error
        });
    }
});

router.delete('/delete/:notificationid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.notificationid
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
        const found_articleNotification = await articleNotificationService.findArticleNotificationById(req.params.notificationid);
        if (found_articleNotification) {
            const deleted_count = await articleNotificationService.deleteArticleNotificationById(req.params.notificationid);
            if (deleted_count.deletedCount !== 1) {
                return res.status(400).json({
                    message: 'Could not delete article notification by provided id'
                });
            } else {
                return res.status(200).json({
                    message: 'Article notification deleted',
                    deletedCount: deleted_count.deletedCount
                });
            }
        } else {
            return res.status(404).json({
                message: "That article notification does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not delete article notification',
            error: error
        });
    }
});

module.exports = router;