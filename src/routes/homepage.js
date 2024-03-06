const express= require('express');
const router = express.Router();
//const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');
const gameService = require('../services/gameService');
const articleService = require('../services/articleService');

router.get('/carousel', async (req, res, next) => {
    try {
        const gameMostDownloads = await gameService.findAllGamesByDownloads(1);
        const gameMostRecent = await gameService.findAllGamesByCreationDateDESC(1);
        const articleMostRecent = await articleService.findAllArticlesByCreationDateDESC(1);

        return res.status(200).json({
            gameMostDownloads: gameMostDownloads[0],
            gameMostRecent: gameMostRecent[0],
            articleMostRecent: articleMostRecent[0]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not process all requests',
            error: error
        });
    }
});

module.exports = router;