import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../App.css';

// UBICACIÓN: src/pages/RegisterPage.js
function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // NUEVO: Estado para mensajes de error específicos
    const [errores, setErrores] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        let errorTemp = { email: '', password: '' };
        let hayError = false;

        // Validar Contraseña
        const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!regexPassword.test(password)) {
            errorTemp.password = "Mínimo 6 caracteres, letras y números.";
            hayError = true;
        }

        // Validar Formato de Correo
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!regexEmail.test(email)) {
            errorTemp.email = "Formato de correo inválido.";
            hayError = true;
        }

        setErrores(errorTemp);
        if (hayError) return;

        try {
            await axios.post(`${API_URL}/auth/register`, { nombre, email: email.toLowerCase(), password });
            alert("✅ ¡Cuenta creada!");
            navigate('/login');
        } catch (err) {
            // Aquí capturamos el error de "Dominio no existe" que enviamos desde el backend
            setErrores({ ...errorTemp, email: err.response?.data?.msg || "Error al registrar" });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <form onSubmit={handleRegister}>
                    <input type="text" placeholder="Tu Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    
                    <input type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    {errores.email && <span className="error-text">{errores.email}</span>}

                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {errores.password && <span className="error-text">{errores.password}</span>}

                    <button type="submit" className="btn-auth secondary">REGISTRARSE</button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;