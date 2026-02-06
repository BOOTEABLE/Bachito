import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../App.css';

function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                nombre,
                email,
                password
            });

            alert("✅ ¡Cuenta creada! Ahora inicia sesión.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            alert("Error: " + (err.response?.data?.msg || "Error al registrar"));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <p>Únete a la red de detección</p>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Tu Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-auth secondary">
                        REGISTRARSE
                    </button>
                </form>
                <div className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
