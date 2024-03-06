const express= require('express');
const router = express.Router();
const userService = require('../services/userService');
const gameService = require('../services/gameService');
const receiptService = require('../services/receiptService');
const globalSchema = require('../verifiers/globalschemas');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

router.get('/getself', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    const userid = req.tokenData.userid;

    try {
        userService.getUserLibrary(userid).then((document) => {
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
            message: "Could not get that user's library",
            error: error
        });
    }
});

router.get('/getuser/:userid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    const userid = req.params.userid;

    try {
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: userid
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
        const found_user = await userService.findUserById(userid);
        if (found_user) {
            console.log("Verifying user existence: " + found_user);
        } else {
            return res.status(400).json({
                message: "That user does not exist"
            });
        }
    } catch (e) {
        console.log(error);
        return res.status(500).json({
            message: "Could not verify user existence",
            error: error.message
        }); 
    }

    try {
        userService.getUserLibrary(userid).then((document) => {
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
            message: "Could not get that user's library",
            error: error
        });
    }
});

router.put('/buy/:gameid', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
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
            console.log("Library found game: " + found_game);
        } else {
            return res.status(400).json({
                message: "That game does not exist"
            });
        }

        const found_user_library = await userService.getUserLibraryWithoutPopulate(req.tokenData.userid);
        if (found_user_library.libreria.includes(gameid)) {
            return res.status(409).json({
                message: "Game already in user library"
            });
        }

        const found_user_wallet = await userService.checkUserFunds(req.tokenData.userid);
        if (found_game.price > found_user_wallet.billetera) {
            return res.status(409).json({
                message: "Unable to process transaction. Deducted amount is greater than account funds"
            });
        } else {
            await userService.updateUserFunds(req.tokenData.userid, -1*found_game.price);
        }

        const userWishlist = await userService.getUserWishlistWithoutPopulate(req.tokenData.userid);
        if (userWishlist.wishlist.includes(gameid)) {
            await userService.removeUserWishlist(req.tokenData.userid, gameid);
        }

        userService.addUserLibrary(req.tokenData.userid, gameid).then(async (document) => {
            const purchase_receipt = await receiptService.createReceipt(req.tokenData.userid, gameid);
            console.log("Created receipt: \n" + purchase_receipt);

            return res.status(200).json({
                message: "Game added to library successfully",
                user: document,
                receipt: purchase_receipt
            });
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "Could process that game buying request",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not buy that game",
            error: error
        });
    }
});

module.exports = router;