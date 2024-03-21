const express= require('express');
const router = express.Router();
const userSchema = require('../verifiers/userschemas');
const userService = require('../services/userService');
const gameService = require('../services/gameService');
const jwt = require('jsonwebtoken');
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

// Main user route '/api/users/'. Currently expects JWT of user type 0
router.get('/getall', tokenAuthentication, checkTipo([0]), (req, res, next) => {
    const paginate_options = {
        limit: parseInt(req.query.limit) || 10,
        page: parseInt(req.query.page) || 1
    };
    
    userService.findAllUsers(paginate_options).then((documents) => {
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

router.get('/get/developers', (req, res, next) => {
    userService.findAllDevelopers().then((documents) => {
        return res.status(200).json(documents);
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({
            message: 'Could not get developers',
            error: error
        });
    });
});

// User route '/api/users/getid/:userid'. Currently expects a valid userid and a JWT of user type 0
router.get('/getid/:userid', (req, res, next) => {
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

// User route '/api/getusername/:username'. Currently expects a valid username and a JWT of user type 0
router.get('/getusername/:username', (req, res, next) => {
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
                error: e.errors
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
            error: error.message
        });
    }
});

// User login route '/api/users/login'. Expects user email and password
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
                error: e.errors
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
            error: error.message
        });
    }
});

// User update route '/api/users/update'. Expects valid JWT and any user field to update as per 'editUserSchema' in './validors'
// Updates the same user that sent the request
router.put('/update', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    try {
        //console.log(req.body);
        userSchema.editUserSchema.validateSync(req.body, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        const find_username_email_result = await userService.findUsernameEmail(req.body.username, req.body.email);
        if (find_username_email_result.found) {
            delete find_username_email_result.found
            let msg = ""
            for (const key in find_username_email_result) {
                if (key == "result_username" && find_username_email_result.hasOwnProperty("result_email")) {
                    msg = msg + find_username_email_result[key] + "\n";
                    continue;
                }
                msg = msg + find_username_email_result[key];
            }
            return res.status(409).json({
                message: msg
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not verify user or email existence',
            error: error.message
        }); 
    }

    try {
        userService.updateUserBySelf(req.tokenData.userid, req.body).then((updated_document) => {
            if (!updated_document) {
                return res.status(400).json({
                    message: "User update empty"
                });
            } else {
                return res.status(200).json({
                    message: "User updated successfully",
                    user: updated_document
                });
            }
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "User update failed",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not edit user',
            error: error.message
        });
    }
});

// User update through route '/api/users/admin/update'. Expects valid JWT of type 0 and any user field to update as per 'editUserAdminSchema' in './validors'
// Updates the given user as per the required 'userid' field in 'editUserAdminSchema' in '../validators/userschemas.js'
router.put('/admin/update', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        if ('fechaCreacion' in req.body) {
            req.body.fechaCreacion = new Date(req.body.fechaCreacion);
        }

        if ('fechaEdicion' in req.body) {
            req.body.fechaEdicion = new Date(req.body.fechaEdicion);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not convert date fields",
            error: error.message
        }); 
    }
    
    try {
        //console.log(req.body);
        userSchema.editUserAdminSchema.validateSync(req.body, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        if ('following' in req.body) {
            const users_following_found = await userService.findUsersByIdArray(req.body.following);
            if (users_following_found.length != req.body.following.length) {
                return res.status(400).json({
                    message: "One or more users in 'following' do not match the database. Make sure they exist and are not repeated"
                }); 
            }
        }

        if ('followers' in req.body) {
            const users_followers_found = await userService.findUsersByIdArray(req.body.followers);
            if (users_followers_found.length != req.body.followers.length) {
                return res.status(400).json({
                    message: "One or more users in 'followers' do not match the database. Make sure they exist and are not repeated"
                }); 
            }
        }

        if ('wishlist' in req.body) {
            const games_wishlist_found = await gameService.findGamesByIdArray(req.body.wishlist);
            if (games_wishlist_found.length != req.body.wishlist.length) {
                return res.status(400).json({
                    message: "One or more games in 'wishlist' do not match the database. Make sure they exist and are not repeated"
                }); 
            }
        }

        if ('libreria' in req.body) {
            const games_libreria_found = await gameService.findGamesByIdArray(req.body.libreria);
            if (games_libreria_found.length != req.body.libreria.length) {
                return res.status(400).json({
                    message: "One or more games in 'libreria' do not match the database. Make sure they exist and are not repeated"
                }); 
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not verify 'following', 'followers', 'wishlist' and/or 'libreria' integrity",
            error: error.message
        }); 
    }

    try {
        // NOTA: CAMBIAR VERIFICACION A JUEGOS REGISTRADOS
        if ('billetera' in req.body) {
            req.body.billetera = parseFloat(req.body.billetera);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Could not convert field 'billetera' to float",
            error: error.message
        }); 
    }

    try {
        const find_username_email_result = await userService.findUsernameEmail(req.body.username, req.body.email);
        if (find_username_email_result.found) {
            return res.status(409).json(find_username_email_result);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not verify user or email existence',
            error: error.message
        }); 
    }

    try {
        const userid = req.body.userid;
        delete req.body.userid;
        userService.updateUserBySelf(userid, req.body).then((updated_document) => {
            if (!updated_document) {
                return res.status(400).json({
                    message: "User update empty"
                });
            } else {
                return res.status(200).json({
                    message: "User updated successfully",
                    user: updated_document
                });
            }
        })
        .catch((error) => {
            console.log(error);
            return res.status(400).json({
                message: "User update failed",
                error: error
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not edit user',
            error: error.message
        });
    }
});

// User self delete through route '/api/users/delete'. Expects valid JWT
// Deletes the same user that sent the request
router.delete('/delete', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    try {
        const deleted_count = await userService.deleteUserById(req.tokenData.userid);
        if (deleted_count.deletedCount !== 1) {
            return res.status(400).json({
                message: 'Could not delete user by provided id'
            });
        } else {
            return res.status(200).json({
                message: 'User deleted',
                deletedCount: deleted_count.deletedCount
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not delete user',
            error: error.message
        });
    }
});

// User delete by admin through route '/api/users/admin/delete/:userid'. Expects valid JWT of type 0 and URL parameter 'userid', which should be a valid user id to delete
// Deletes the given user specified by the appended user id
router.delete('/admin/delete/:userid', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        const deleted_count = await userService.deleteUserById(req.params.userid);
        if (deleted_count.deletedCount !== 1) {
            return res.status(400).json({
                message: 'Could not delete user by provided id'
            });
        } else {
            return res.status(200).json({
                message: 'User deleted',
                deletedCount: deleted_count.deletedCount
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not delete user',
            error: error.message
        });
    }
});

// User funds update through route '/api/users/funds'. Expects valid JWT, 'mode' of update and 'amount' to update as per 'userBillingSchema' in '../validators/userschemas.js'
// Increments ('mode': 'INC') or decreases ('mode': 'DEC') the funds of the user that sent the request by 'amount'
router.put('/funds', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    try {
        //console.log(req.body);
        userSchema.userBillingSchema.validateSync(req.body, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    let amount = 0;
    try {
        amount = parseFloat(req.body.amount);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not assign amount decimals',
            error: error.message
        });
    }

    switch (req.body.mode) {
        case 'INC':
            amount *= 1;
            break;
        case 'DEC':
            try {
                const user_funds = await userService.checkUserFunds(req.tokenData.userid);
                if (amount > user_funds.billetera) {
                    return res.status(409).json({
                        message: "Unable to process transaction. Deducted amount is greater than account funds"
                    });
                }
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    message: 'Could not check user funds for DEC',
                    error: error.message
                });
            }
            amount *= -1;
            break;
    }

    try {
        const updated_user = await userService.updateUserFunds(req.tokenData.userid, amount);
        if (!updated_user) {
            return res.status(400).json({
                message: "User update empty"
            });
        } else {
            return res.status(200).json({
                message: "User funds updated successfully",
                user: updated_user
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not update user funds',
            error: error.message
        });
    }
});

// User register by admin route '/api/users/admin/register'. Expects valid JWT of type 0 and main user data. See body for details
router.post('/admin/register', tokenAuthentication, checkTipo([0]), async (req, res, next) => {
    try {
        //console.log(req.body);
        userSchema.registerUserAdminSchema.validateSync(req.body, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        const user = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            username: req.body.username,
            email: req.body.email,
            profileURL: req.body.profileURL ? req.body.profileURL : `https://ui-avatars.com/api/?name=${req.body.username}&size=128`,
            password: req.body.password,
            tipo: req.body.tipo,
            billetera: parseFloat(req.body.billetera),
            blocked: req.body.blocked
        }

        const find_username_email_result = await userService.findUsernameEmail(user.username, user.email);
        if (find_username_email_result.found) {
            return res.status(422).json(find_username_email_result);
        }
        
        userService.createUserAdmin(user).then((insert_result) =>{
            console.log(insert_result);
            if (insert_result) {
                return res.status(201).json({
                    message: 'New user created through admin',
                    user: insert_result
                });
            } else {
                return res.status(422).json({
                    message: 'Could not create the user through admin'
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not create the user through admin',
            error: error.message
        });
    }
});

// User password change route '/api/users/password'. Expects valid JWT of any type, old password, new password and confirmed password
// Changes password of self
router.put('/password', tokenAuthentication, checkTipo([0, 1, 2]), async (req, res, next) => {
    try {
        //console.log(req.body);
        userSchema.passwordUpdateSchema.validateSync(req.body, {abortEarly: false});
    } catch (e) {
        console.log(e.errors);
        if (e.errors !== undefined) {
            return res.status(422).json({
                error: e.errors
            });
        }
    }

    try {
        const find_user_email = await userService.findByEmail(req.tokenData.email);
        if (!find_user_email) {
            return res.status(401).json({
                message: "Authentication failed",
            });
        }

        userService.validatePassword(req.body.oldPassword, find_user_email).then((passwordMatch) => {
            if (passwordMatch) {
                userService.hashpassword(req.body.newPassword).then((hash_new_password) => {
                    userService.updateUserBySelf(req.tokenData.userid, {
                        password: hash_new_password
                    }).then((new_user) => {
                        if (!new_user) {
                            return res.status(400).json({
                                message: "User password update empty"
                            });
                        } else {
                            return res.status(200).json({
                                message: "User password updated successfully",
                                user: new_user
                            });
                        }
                    });
                });
            } else {
                return res.status(401).json({
                    message: 'Wrong old password'
                });
            }
        })
        .catch((error) => {
            return res.status(400).json({
                message: 'Authentication error',
                error: error.message
            });
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Could not change user password',
            error: error.message
        });
    }
});

module.exports = router;