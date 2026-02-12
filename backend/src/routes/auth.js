// UBICACIÓN: backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dns = require('dns'); // Importamos DNS al inicio

const JWT_SECRET = 'mi_secreto_super_seguro_tesis_123';

// --- 1. REGISTRARSE (Con validación DNS y DB) ---
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const dominio = email.split('@')[1];

        // A. Validar existencia real del dominio en Internet
        dns.resolveMx(dominio, async (err, addresses) => {
            if (err || !addresses || addresses.length === 0) {
                return res.status(400).json({ msg: `El dominio @${dominio} no es un servidor de correo real.` });
            }

            try {
                // B. Verificar si el usuario ya existe en MongoDB
                const userExists = await User.findOne({ email });
                if (userExists) return res.status(400).json({ msg: 'Este correo ya está registrado.' });

                // C. Encriptar contraseña
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // D. Guardar nuevo usuario
                const newUser = new User({ nombre, email, password: hashedPassword });
                await newUser.save();

                res.json({ msg: 'Usuario registrado con éxito' });
            } catch (dbErr) {
                res.status(500).json({ error: "Error en base de datos: " + dbErr.message });
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Error de servidor: " + err.message });
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
// backend/routes/auth.js
router.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;
    const dominio = email.split('@')[1];

    // Verificar si el dominio tiene registros MX (Mail Exchange)
    dns.resolveMx(dominio, async (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
            // Si el dominio no existe o no es un servidor de correo real
            return res.status(400).json({ msg: "El dominio @" + dominio + " no existe." });
        }

        // Si el dominio es real, entonces seguimos con el guardado en MongoDB
        try {
            const userExists = await User.findOne({ email });
            if (userExists) return res.status(400).json({ msg: 'El correo ya existe' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({ nombre, email, password: hashedPassword });
            await newUser.save();

            res.json({ msg: 'Usuario registrado con éxito' });
        
        } catch (dbErr) {
            res.status(500).json({ error: dbErr.message });
        }
    });
});
module.exports = router;