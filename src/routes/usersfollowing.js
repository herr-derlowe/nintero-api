const express= require('express');
const router = express.Router();
const userService = require('../services/userService');
const globalSchema = require('../verifiers/globalschemas');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

router.get('/getfollowing/:userid', async (req, res, next) => {
    const userid = req.params.userid;
    try {
        console.log('Userid: ' + userid);
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
            console.log("Following found user: " + found_user);
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
        userService.getUserFollowing(userid).then((document) => {
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
            message: "Could not get that user's following list",
            error: error
        });
    }
});

router.get('/getfollowers/:userid', async (req, res, next) => {
    const userid = req.params.userid;
    try {
        console.log('Userid: ' + userid);
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
            console.log("Followers found user: " + found_user);
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
        userService.getUserFollowers(userid).then((document) => {
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
            message: "Could not get that user's followers list",
            error: error
        });
    }
});

router.put('/add/:userid', tokenAuthentication, checkTipo([1, 2]), async (req, res, next) => {
    const userid = req.params.userid;
    try {
        console.log('Userid: ' + userid);
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
            console.log("Following found user: " + found_user);
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
        userService.addUserFollowing(req.tokenData.userid, userid).then((document) => {
            return res.status(200).json({
                message: "User followed successfully",
                user: document
            });
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "Could process that user following request",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not add that user to following list",
            error: error
        });
    }
});

router.put('/remove/:userid', tokenAuthentication, checkTipo([1, 2]), async (req, res, next) => {
    const userid = req.params.userid;
    try {
        console.log('Userid: ' + userid);
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
            console.log("Unfollowing found user: " + found_user);
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
        userService.removeUserFollowing(req.tokenData.userid, userid).then((document) => {
            return res.status(200).json({
                message: "User unfollowed successfully",
                user: document
            });
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "Could process that user unfollowing request",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not remove that user from the following list",
            error: error
        });
    }
});

module.exports = router;