import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../App.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Para manejar el error de credenciales
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpiamos errores previos

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.user.nombre);
            localStorage.setItem('userRole', res.data.user.role); 

            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                alert(`Bienvenido, ${res.data.user.nombre} 👋`);
                navigate('/');
            }            
            
        } catch (err) {
            setError(err.response?.data?.msg || "Credenciales incorrectas");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Iniciar Sesión</h2>
                    <p>Bienvenido de vuelta a <strong>Bachito</strong></p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            placeholder="ejemplo@correo.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            className={error ? "input-error" : ""}
                            type="password" 
                            placeholder="Tu contraseña" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        {error && <span className="error-text">{error}</span>}
                    </div>

                    <button type="submit" className="btn-primary-auth">ENTRAR</button>
                </form>

                <div className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;