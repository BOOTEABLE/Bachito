const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email:  { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // 👇 NUEVO CAMPO:
    role: { type: String, default: 'user' }, // Puede ser 'user' o 'admin'
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);