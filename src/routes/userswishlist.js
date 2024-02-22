const express= require('express');
const router = express.Router();
const userService = require('../services/userService');
const gameService = require('../services/gameService');
const globalSchema = require('../verifiers/globalschemas');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

router.get('/get', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    const userid = req.tokenData.userid;

    try {
        userService.getUserWishlist(userid).then((document) => {
            return res.status(200).json(document);
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "Could not get that user",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not get that user's wishlist",
            error: error
        });
    }
});

router.put('/add/:gameid', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    const gameid = req.params.gameid;
    
    try {
        console.log('Gameid: ' + gameid);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: gameid
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
        const found_game = await gameService.findGameById(gameid);
        if (found_game) {
            console.log("Wishlist found game: " + found_game);
        } else {
            return res.status(400).json({
                message: "That game does not exist"
            });
        }
    } catch (e) {
        console.log(error);
        return res.status(500).json({
            message: "Could not verify game existence",
            error: error.message
        }); 
    }

    try {
        userService.addUserWishlist(req.tokenData.userid, gameid).then((document) => {
            return res.status(200).json({
                message: "Game wishlisted successfully",
                user: document
            });
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "Could process that game wishlist request",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not add that game to wishlist",
            error: error
        });
    }
});

router.put('/remove/:gameid', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    const gameid = req.params.gameid;
    try {
        console.log('Gameid: ' + gameid);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: gameid
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
        const found_game = await gameService.findGameById(gameid);
        if (found_game) {
            console.log("Removing from wishlist found game: " + found_game);
        } else {
            return res.status(400).json({
                message: "That game does not exist"
            });
        }
    } catch (e) {
        console.log(error);
        return res.status(500).json({
            message: "Could not verify game existence",
            error: error.message
        }); 
    }

    try {
        userService.removeUserWishlist(req.tokenData.userid, gameid).then((document) => {
            return res.status(200).json({
                message: "Game removed from wishlist successfully",
                user: document
            });
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "Could process that game wishlist removal request",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not remove that game from wishlist",
            error: error
        });
    }
});

module.exports = router;