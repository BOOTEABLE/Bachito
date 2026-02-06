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
            const res = await axios.post(
                `${API_URL}/api/auth/login`,
                { email, password }
            );

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.user.nombre);
            localStorage.setItem('userRole', res.data.user.role);

            const role = res.data.user.role;

            switch (role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'explorador':
                    navigate('/config');
                    break;
                default:
                    navigate('/');
            }

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Iniciar Sesión</h2>
                <p>Bienvenido al Oráculo</p>
                <form onSubmit={handleLogin}>
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
