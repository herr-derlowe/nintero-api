const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/userService');

/**
 * @description Authenticates JWT inside of "Authorization" header
 */
const tokenAuthentication = (req, res, next) => {
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
          req.tokenData = decoded;
          next();
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Token auhtentication failed',
            error: error
        })
    }    
}

/**
 * @description Validates user type inside of argument array, refer to user models for specification
 */
const checkTipo = (tipos) => async (req, res, next) => {
    // userd from req.tokenData.userid present in token singing
    const user = await findUserById(req.tokenData.userid);
    if (!tipos.includes(user.tipo)) {
        return res.status(401).json({
            message: "Route unauthorized"
        });
    } else {
        next();
    }
};

module.exports = {
    tokenAuthentication,
    checkTipo
}