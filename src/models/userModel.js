const mongoose = require('mongoose');

function getBilletera(value) {
    if (typeof value !== 'undefined') {
       return parseFloat(value.toString());
    }
    return value;
};


const userModel = mongoose.Schema({
    nombre: String,
    apellido: String,
    username: String,
    email: String,
    profileURL: String,
    password: String,
    // tipos de usuario. 0 admin, 1 developer, 2 normal
    tipo: Number,
    billetera: {
        type: mongoose.Types.Decimal128,
        default: 0,
        get: getBilletera
    },
    fechaCreacion: Date,
    fechaEdicion: Date,
    blocked: Boolean,
    following: [{
        type: mongoose.Types.ObjectId, ref: 'User'
    }],
    followingCount: {
        type: Number,
        get: function () {
            return this.following.length
        }
    },
    followers: [{
        type: mongoose.Types.ObjectId, ref: 'User'
    }],
    followersCount: {
        type: Number,
        get: function () {
            return this.followers.length
        }
    },
    wishlist: [{
        type: mongoose.Types.ObjectId, ref: 'Game'
    }],
    wishlistCount: {
        type: Number,
        get: function () {
            return this.wishlist.length
        }
    },
    libreria: [{
        type: mongoose.Types.ObjectId, ref: 'Game'
    }],
    libreriaCount: {
        type: Number,
        get: function () {
            return this.libreria.length
        }
    }
}, {id: false, toJSON: { getters: true/*, virtuals: true*/}});

// userModel.virtual('followingCount').get(function() {
//     return this.following.length;
// });

// userModel.virtual('followersCount').get(function() {
//     return this.followers.length;
// });

module.exports = mongoose.model('User', userModel);