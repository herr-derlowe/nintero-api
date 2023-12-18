const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const mongo = require('mongodb');

/**
 * @description DB user register service, expects user main data from '/api/users/register' route
*/
async function createUser(userbody) {
    const userdoc = new User({
        nombre: userbody.nombre,
        apellido: userbody.apellido,
        username: userbody.username,
        email: userbody.email,
        profileURL: userbody.profileURL,
        password: await hashpassword(userbody.password),
        // tipos de usuario. 0 admin, 1 developer, 2 normal
        tipo: 2,
        billetera: 0.0,
        fechaCreacion: new Date(),
        fechaEdicion: new Date(),
        blocked: false,
        wishlist: [],
        libreria: []
    });

    return await userdoc.save();
}

/**
 * @description DB user listing service, returns promise containing array of user documents
*/
async function findAllUsers() {
    return await User.find().exec();
}

/**
 * @description DB single user service. Expects user ObjectId and returns promise containing user document
*/
async function findUserById(userid) {
    return await User.findById(userid).exec();
}

/**
 * @description DB user email and name service. Expects user email and username, returns promise containing boolean if it finds any of them
*/
async function findUsernameEmail(username, email) {
    const result_username = await User.findOne({username: username}).exec();
    const result_email = await User.findOne({email: email}).exec();
    
    let find_detail = {
        found: false
    };

    if (result_username) {
        find_detail.found = true;
        find_detail.result_username = "Username already in use"
    }
    if (result_email) {
        find_detail.found = true;
        find_detail.result_email = "Email already in use"
    }
    return find_detail;
}

/**
 * @description DB user by email service. Expects user email and returns promise containing user document
*/
async function findByEmail(email) {
    let query = {email: email};
    const result = await User.findOne(query).exec();
    
    return result;
}

/**
 * @description DB user by username service. Expects username and returns promise containing user document
*/
async function findUserByUsername(username) {
    let query = {username: username};
    const result = await User.findOne(query).exec();
    
    return result;
}

/**
 * @description DB users by id array service. Expects array of user ids and returns promise containing array of documents
*/
async function findUsersByIdArray(id_array){
    let search_query = { $in: id_array};
    return await User.find({ _id: search_query });
}

/**
 * @description DB user update service, expects valid user id and user fields to update. Returns new updated document
*/
async function updateUserBySelf(userid, update_data) {
    update_data.fechaEdicion = new Date();
    let update_query = { $set: update_data};
    return await User.findOneAndUpdate({ _id: userid }, update_query, { new: true });
}

/**
 * @description DB user delete by id service, expects valid user id. Returns count of deleted documents as deletedCount inside an object
*/
async function deleteUserById(userid) {
    return await User.deleteOne({ _id: userid });
}

async function updateUserFunds(userid, amount){
    let query = { $inc: { billetera:  mongo.Decimal128.fromString(amount.toString())}};
    return await User.findOneAndUpdate({ _id: userid }, query, { new: true }); 
}

async function checkUserFunds(userid) {
    return await User.findById(userid, 'billetera');
}

/**
 * @description DB user register admin service, expects user main data from '/api/users/admin/register' route
*/
async function createUserAdmin(userbody) {
    const userdoc = new User({
        nombre: userbody.nombre,
        apellido: userbody.apellido,
        username: userbody.username,
        email: userbody.email,
        profileURL: userbody.profileURL,
        password: await hashpassword(userbody.password),
        // tipos de usuario. 0 admin, 1 developer, 2 normal
        tipo: userbody.tipo,
        billetera: userbody.billetera,
        fechaCreacion: new Date(),
        fechaEdicion: new Date(),
        blocked: userbody.blocked,
        wishlist: [],
        libreria: []
    });

    return await userdoc.save();
}

/**
 * @description User password hashing service. Expects user password and returns promise containing hashed password
*/
async function hashpassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * @description Password validation service. Expects user password and user documents, returns promise containing boolean for password validity
*/
async function validatePassword(password, user){
    return await bcrypt.compare(password, user.password);
}

module.exports = {
    findAllUsers,
    findUserById,
    findUsernameEmail,
    findByEmail,
    findUserByUsername,
    validatePassword,
    createUser,
    updateUserBySelf,
    findUsersByIdArray,
    deleteUserById,
    updateUserFunds,
    checkUserFunds,
    createUserAdmin
}