// UBICACIÓN: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// CLAVE SECRETA (En un proyecto real va en .env, para tesis ponla aquí)
const JWT_SECRET = 'mi_secreto_super_seguro_tesis_123';

// --- 1. REGISTRARSE (SIGN UP) ---
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si ya existe
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: 'El correo ya existe' });

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const newUser = new User({ nombre, email, password: hashedPassword });
        await newUser.save();

        res.json({ msg: 'Usuario registrado con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. INICIAR SESIÓN (LOGIN) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });

        // Generar Token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                nombre: user.nombre, 
                email: user.email,
                role: user.role // <--- ¡IMPORTANTE! Enviamos el rol
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;