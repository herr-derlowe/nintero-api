const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    nombre: String,
    apellido: String,
    username: String,
    email: String,
    profileURL: String,
    password: String,
    // tipos de usuario. 0 admin, 1 developer, 2 normal
    tipo: Number,
    billetera: Number,
    fechaCreacion: Date,
    fechaEdicion: Date,
    blocked: Boolean,
    wishlist: [mongoose.Types.ObjectId],
    libreria: [mongoose.Types.ObjectId]
});

module.exports = mongoose.model('User', userModel);