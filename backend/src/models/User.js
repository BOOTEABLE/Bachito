// UBICACIÓN: backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email:  { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Se guardará encriptada
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);