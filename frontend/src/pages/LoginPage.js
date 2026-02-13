import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../App.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // OJO: IP del Backend (4000)
            const ip = localStorage.getItem('serverIp') || 'localhost';
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.user.nombre);
            
            // 👇 NUEVO: Guardamos el rol
            localStorage.setItem('userRole', res.data.user.role); 

            // Redirección inteligente
            if (res.data.user.role === 'admin') {
                navigate('/admin'); // Si es jefe, va al panel
            } else {
                alert(`Bienvenido, ${res.data.user.nombre} 👋`);
                navigate('/'); // Nos lleva al mapa
            }            
            
        } catch (err) {
            alert("Error: " + (err.response?.data?.msg || "Revisa tus datos"));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Iniciar Sesión</h2>
                <p>Bienvenido a Bachito</p>
                <form onSubmit={handleLogin}>
                    <input 
                        type="email" placeholder="Correo Electrónico" 
                        value={email} onChange={(e) => setEmail(e.target.value)} required 
                    />
                    <input 
                        type="password" placeholder="Contraseña" 
                        value={password} onChange={(e) => setPassword(e.target.value)} required 
                    />
                    <button type="submit" className="btn-auth">ENTRAR</button>
                </form>
                <div className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;