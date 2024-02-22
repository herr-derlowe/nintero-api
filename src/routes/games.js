const express= require('express');
const router = express.Router();
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');
const gameService = require('../services/gameService');
const gameSchema = require('../verifiers/gameschemas');
const globalSchema = require('../verifiers/globalschemas');
const userService = require('../services/userService');

router.get('/', (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };
    
    gameService.findAllGames(paginate_options).then((documents) => {
        return res.status(200).json(documents);
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get games',
            error: error
        });
    });
});

router.get('/selectid/:gameid', (req, res, next) => {
    const game_id = req.params.gameid;

    gameService.findGameById(game_id).then((document) => {
        if (document) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "That game does not exist"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get that game',
            error: error
        });
    });
});

router.get('/sortdownloads', (req, res, next) => {
    const amount_of_games = parseInt(req.query.amount) || 4;
    console.log("Amount selected: " + amount_of_games);
    
    gameService.findAllGamesByDownloads(amount_of_games).then((documents) => {
        return res.status(200).json(documents);
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get games by downloads',
            error: error
        });
    });
});

router.post('/filter', async (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    try {
        if (req.body.price) {
            req.body.price = parseFloat(req.body.price);
        }

        gameSchema.filterGameSchema.validateSync(req.body, {abortEarly: false});
        if ('developer' in req.body) {
            globalSchema.handleObjectIdSchema.validateSync({
                entity_id: req.body.developer
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
        if ('developer' in req.body) {
            const found_user = await userService.findUserById(req.body.developer);
            if (found_user) {
                console.log(found_user);
            } else {
                return res.status(404).json({
                    message: "That developer does not exist"
                });
            }
        }
    } catch (e) {
        console.log(error);
        return res.status(500).json({
            message: "Could not verify developer",
            error: error.message
        }); 
    }

    gameService.findGamesWithFilters(req.body, paginate_options).then((document) => {
        if (document.docs.length !== 0) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "Couldn't find any games with those filters"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get any games',
            error: error
        });
    });
});

router.post('/create', tokenAuthentication, checkTipo([0, 1]), (req, res, next) => {
    let game_price;
    try {
        game_price = parseFloat(req.body.price);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not convert game price',
            error: error.message
        });
    }
    
    const new_game = {
        name: req.body.name,
        about: req.body.about,
        category: req.body.category,
        thumbnailURL: req.body.thumbnailURL,
        gameImages: req.body.gameImages,
        price: game_price,
        minreq: req.body.minreq,
        recreq: req.body.recreq,
    }

    try {
        //console.log(req.body);
        gameSchema.createGameSchema.validateSync(new_game, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {        
        gameService.createNewGame(new_game, req.tokenData.userid).then((insert_result) =>{
            console.log(insert_result);
            if (insert_result) {
                return res.status(201).json({
                    message: 'New game created',
                    game: insert_result
                });
            } else {
                return res.status(422).json({
                    message: 'Could not create the game'
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not create the game',
            error: error.message
        });
    }
});

router.delete('/delete/:gameid', tokenAuthentication, checkTipo([0, 1]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.gameid
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
        const found_game = await gameService.findGameById(req.params.gameid);
        if (found_game && req.tokenData.tipo == 1 && found_game.developer._id != req.tokenData.userid) {
            return res.status(401).json({
                message: "You are not the developer/publisher of that game"
            });
        } else if (found_game) {
            const deleted_count = await gameService.deleteGameById(req.params.gameid);
            if (deleted_count.deletedCount !== 1) {
                return res.status(400).json({
                    message: 'Could not delete game by provided id'
                });
            } else {
                return res.status(200).json({
                    message: 'Game deleted',
                    deletedCount: deleted_count.deletedCount
                });
            }
        } else {
            return res.status(404).json({
                message: "That game does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not delete game',
            error: error
        });
    }
});

router.put('/update/:gameid', tokenAuthentication, checkTipo([1]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.gameid
        }, {abortEarly: false});
        if (req.body.price) {
            req.body.price = parseFloat(req.body.price);
        }

        gameSchema.updateGameSchema.validateSync(req.body, { abortEarly: false });
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        const found_game = await gameService.findGameById(req.params.gameid);

        if (found_game && found_game.developer._id != req.tokenData.userid) {
            return res.status(401).json({
                message: "You are not the author of that game"
            });
        } else if (found_game) {
            gameService.updateGameById(req.params.gameid, req.body).then((updated_document) => {
                if (!updated_document) {
                    return res.status(400).json({
                        message: "Game update empty"
                    });
                } else {
                    return res.status(200).json({
                        message: "Game updated successfully",
                        game: updated_document
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                return res.status(400).json({
                    message: "Game update failed",
                    error: error
                });
            });
        } else {
            return res.status(404).json({
                message: "That game does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not update game',
            error: error
        });
    }
});

router.put('/admin/update/:gameid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.gameid
        }, {abortEarly: false});

        if (req.body.price) {
            req.body.price = parseFloat(req.body.price);
        }

        gameSchema.updateAdminGameSchema.validateSync(req.body, {abortEarly: false});
        if ('developer' in req.body) {
            globalSchema.handleObjectIdSchema.validateSync({
                entity_id: req.body.developer
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
        if ('developer' in req.body) {
            const found_user = await userService.findUserById(req.body.developer);
            if (found_user) {
                console.log(found_user);
            } else {
                return res.status(404).json({
                    message: "That developer does not exist"
                });
            }
        }
    } catch (e) {
        console.log(error);
        return res.status(500).json({
            message: "Could not verify developer",
            error: error.message
        }); 
    }

    try {
        const updated_document = await gameService.updateGameById(req.params.gameid, req.body);
        if (updated_document) {
            return res.status(200).json({
                message: "Game updated successfully",
                game: updated_document
            });
        } else {
            return res.status(400).json({
                message: "Game update empty"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not update game',
            error: error.message
        });
    }
});

module.exports = router;