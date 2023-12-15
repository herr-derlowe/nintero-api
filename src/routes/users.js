const express= require('express');
const router = express.Router();
const userSchema = require('../validators/userschemas');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

// Main user route '/api/users/'. Currently expects JWT of user type 0 or 1
router.get('/getall', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    userService.findAllUsers().then((documents) => {
        return res.status(200).json(documents);
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get users',
            error: error
        });
    });
});

// User route '/api/users/getid/:userid'. Currently expects a valid userid and a JWT of user type 0 or 1
router.get('/getid/:userid', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    const userid = req.params.userid;

    userService.findUserById(userid).then((document) => {
        if (document) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "That user does not exist"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get that user',
            error: error
        });
    });
});

router.get('/getusername/:username', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    const username = req.params.username;

    userService.findUserByUsername(username).then((document) => {
        if (document) {
            return res.status(200).json(document);
        } else {
            return res.status(404).json({
                message: "That user does not exist"
            });
        }
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get that user',
            error: error
        });
    });
});

// User register route '/api/users/register'. Expects main user data. See body for details
router.post('/register', async (req, res, next) => {
    const user = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        username: req.body.username,
        email: req.body.email,
        profileURL: req.body.profileURL ? req.body.profileURL : `https://ui-avatars.com/api/?name=${req.body.username}&size=128`,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    }

    try {
        //console.log(req.body);
        userSchema.registerSchema.validateSync(user, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                errors: e.errors
            });
        }
    }

    try {
        const find_username_email_result = await userService.findUsernameEmail(user.username, user.email);
        if (find_username_email_result.found) {
            return res.status(422).json(find_username_email_result);
        }
        
        userService.createUser(user).then((insert_result) =>{
            console.log(insert_result);
            if (insert_result) {
                return res.status(201).json({
                    message: 'New user created'
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
            error: error
        });
    }
});

// User register route '/api/users/login'. Expects user email and password
router.post('/login', async (req, res, next) => {
    const login_data = {
        email: req.body.email,
        password: req.body.password
    };

    try {
        //console.log(req.body);
        userSchema.loginSchema.validateSync(login_data, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                errors: e.errors
            });
        }
    }

    try {
        const find_user_email = await userService.findByEmail(login_data.email);
        if (!find_user_email) {
            return res.status(401).json({
                message: "Authentication failed",
            });
        }
        
        userService.validatePassword(login_data.password, find_user_email).then((passwordMatch) => {
            if (passwordMatch) {
                const token = jwt.sign({
                    userid: find_user_email._id,
                    username: find_user_email.username,
                    email: find_user_email.email,
                    tipo: find_user_email.tipo
                }, process.env.SECRET_KEY,
                {
                    expiresIn: "30m"
                });

                return res.status(200).json({
                    message: 'Authentication successful',
                    token: token,
                    user: find_user_email
                });
            } else {
                return res.status(401).json({
                    message: 'Authentication failed'
                });
            }
        })
        .catch((error) => {
            return res.status(400).json({
                message: 'Authentication error',
                erorr: error
            });
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not login user',
            error: error
        });
    }
});

module.exports = router;