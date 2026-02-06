// UBICACIÓN: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ⚠️ En producción va en .env
const JWT_SECRET = 'mi_secreto_super_seguro_tesis_123';

// =======================================================
// REGISTRO DE USUARIO
// =======================================================
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, role } = req.body;

        // Validaciones básicas
        if (!nombre || !email || !password) {
            return res.status(400).json({ msg: 'Faltan campos obligatorios' });
        }

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'El correo ya está registrado' });
        }

        // Validar rol permitido
        const rolesPermitidos = ['admin', 'usuario', 'explorador'];
        const rolFinal = rolesPermitidos.includes(role) ? role : 'usuario';

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const newUser = new User({
            nombre,
            email,
            password: hashedPassword,
            role: rolFinal
        });

        await newUser.save();

        res.status(201).json({
            msg: 'Usuario registrado correctamente',
            user: {
                nombre: newUser.nombre,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =======================================================
// LOGIN
// =======================================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validaciones
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email y contraseña requeridos' });
        }

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Usuario no encontrado' });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        // Crear token JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
