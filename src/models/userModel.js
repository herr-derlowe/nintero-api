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
    wishlist: [mongoose.Types.ObjectId],
    libreria: [mongoose.Types.ObjectId]
}, {id: false, toJSON: { getters: true}});

module.exports = mongoose.model('User', userModel);