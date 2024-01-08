const express= require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/jwt', (req, res, next) => {
    try {
        const auth_header = req.headers.authorization;
        if (!auth_header) {
            return res.status(403).json({
                message: 'Token missing'
            });
        }
        console.log(auth_header);
        const token = auth_header.split(" ")[1];

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
          console.log("verifying");
          if (err) {
            return res.status(403).json(err);
          }

          console.log(decoded);
          return res.sendStatus(200);
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Token auhtentication failed',
            error: error.message
        });
    }    
});

module.exports = router;