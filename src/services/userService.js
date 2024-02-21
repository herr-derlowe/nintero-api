const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Game = require('../models/gameModel');
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
        following: [],
        followers: [],
        wishlist: [],
        libreria: []
    });

    return await userdoc.save();
}

/**
 * @description DB user listing service, returns promise containing array of user documents
*/
async function findAllUsers() {
    return await User.find().populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
}

async function findAllDevelopers() {
    return await User.find({ tipo: 1 }).populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
}

/**
 * @description DB single user service. Expects user ObjectId and returns promise containing user document
*/
async function findUserById(userid) {
    return await User.findById(userid).populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
}

/**
 * @description DB user email and name service. Expects user email and username, returns promise containing boolean if it finds any of them
*/
async function findUsernameEmail(username, email) {
    const result_username = await User.findOne({username: username}).populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
    const result_email = await User.findOne({email: email}).populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
    
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
    const result = await User.findOne(query).populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
    
    return result;
}

/**
 * @description DB user by username service. Expects username and returns promise containing user document
*/
async function findUserByUsername(username) {
    let query = {username: username};
    const result = await User.findOne(query).populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
    
    return result;
}

/**
 * @description DB users by id array service. Expects array of user ids and returns promise containing array of documents
*/
async function findUsersByIdArray(id_array){
    let search_query = { $in: id_array};
    return await User.find({ _id: search_query }).populate('following').populate('followers').populate('wishlist').populate('libreria').exec();
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

async function getUserFollowing(userid) {
    return await User.findOne({ _id: userid }, 'following followingCount').populate('following');
}

async function getUserFollowers(userid) {
    return await User.findOne({ _id: userid }, 'followers followersCount').populate('followers');
}

async function addUserFollowing(self_userid, userid_to_follow) {
    const selfuser_update_query = { $addToSet: { following: userid_to_follow }};
    const followeduser_update_query = { $addToSet: { followers: self_userid } }
    await User.findOneAndUpdate({ _id: userid_to_follow }, followeduser_update_query);
    return await User.findOneAndUpdate({ _id: self_userid }, selfuser_update_query, { new: true });
}

async function removeUserFollowing(self_userid, userid_to_unfollow) {
    const selfuser_update_query = { $pull: { following: userid_to_unfollow }};
    const unfolloweduser_update_query = { $pull: { followers: self_userid } }
    await User.findOneAndUpdate({ _id: userid_to_unfollow }, unfolloweduser_update_query);
    return await User.findOneAndUpdate({ _id: self_userid }, selfuser_update_query, { new: true });
}

async function getUserWishlist(userid) {
    return await User.findOne({ _id: userid }, 'wishlist wishlistCount').populate('wishlist');
} 

async function addUserWishlist(userid, wishlist_gameid) {
    const selfuser_update_query = { $addToSet: { wishlist: wishlist_gameid }};
    const wishlistedgame_update_query = { $addToSet: { wishlistedUsers: userid } }
    await Game.findOneAndUpdate({ _id: wishlist_gameid }, wishlistedgame_update_query);
    return await User.findOneAndUpdate({ _id: userid }, selfuser_update_query, { new: true });
}

async function removeUserWishlist(userid, wishlist_gameid) {
    const selfuser_update_query = { $pull: { wishlist: wishlist_gameid }};
    const wishlistedgame_update_query = { $pull: { wishlistedUsers: userid } }
    await Game.findOneAndUpdate({ _id: wishlist_gameid }, wishlistedgame_update_query);
    return await User.findOneAndUpdate({ _id: userid }, selfuser_update_query, { new: true });
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
        following: [],
        followers: [],
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
    findAllDevelopers,
    findUserById,
    findUsernameEmail,
    findByEmail,
    findUserByUsername,
    hashpassword,
    validatePassword,
    createUser,
    updateUserBySelf,
    findUsersByIdArray,
    deleteUserById,
    updateUserFunds,
    checkUserFunds,
    createUserAdmin,
    getUserFollowing,
    getUserFollowers,
    addUserFollowing,
    removeUserFollowing,
    getUserWishlist,
    addUserWishlist,
    removeUserWishlist
}