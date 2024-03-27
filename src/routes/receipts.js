const express= require('express');
const router = express.Router();
const userService = require('../services/userService');
const receiptService = require('../services/receiptService');
const globalSchema = require('../verifiers/globalschemas');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

router.get('/getall', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    receiptService.findAllReceipts(paginate_options).then((documents) => {
        return res.status(200).json(documents);
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get receipts',
            error: error
        });
    });
});

router.get('/getself', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    const userid = req.tokenData.userid;
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

    try {
        receiptService.findUserReceipts(userid, paginate_options).then((documents) => {
            return res.status(200).json(documents);
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
            message: "Could not get that user's receipts",
            error: error
        });
    }
});

router.get('/getuser/:userid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    const userid = req.params.userid;
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };

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
        receiptService.findUserReceipts(userid, paginate_options).then((document) => {
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
            message: "Could not get that user's receipts",
            error: error
        });
    }
});

router.get('/getbyid/:receiptid', tokenAuthentication, checkTipo([0, 1, 2]), (req, res, next) => {
    const receipt_id = req.params.receiptid;

    try {
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: receipt_id
        }, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    receiptService.findReceiptById(receipt_id).then((document) => {
        if (document) {
            if (req.tokenData.tipo == 0) {
                return res.status(200).json(document);
            } else {
                if (req.tokenData.userid == document.user._id) {
                    return res.status(200).json(document);
                } else {
                    return res.status(401).json({
                        message: "You are not the subject of that receipt"
                    });
                }
            }
        } else {
            return res.status(404).json({
                message: "That receipt does not exist"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get that receipt',
            error: error
        });
    });
});

router.delete('/delete/:receiptid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        //console.log(req.body);
        globalSchema.handleObjectIdSchema.validateSync({
            entity_id: req.params.receiptid
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
        const found_receipt = await receiptService.findReceiptById(req.params.receiptid);
        if (found_receipt) {
            const deleted_count = await receiptService.deleteReceipt(req.params.receiptid);
            if (deleted_count.deletedCount !== 1) {
                return res.status(400).json({
                    message: 'Could not delete receipt by provided id'
                });
            } else {
                return res.status(200).json({
                    message: 'Receipt deleted',
                    deletedCount: deleted_count.deletedCount
                });
            }
        } else {
            return res.status(404).json({
                message: "That receipt does not exist"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not delete receipt',
            error: error
        });
    }
});

module.exports = router;