import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../App.css';

function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errores, setErrores] = useState({ nombre: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        let errorTemp = { nombre: '', email: '', password: '' };
        let hayError = false;

        if (nombre.length < 3 || nombre.length > 20) {
            errorTemp.nombre = "Nombre entre 3 y 20 letras.";
            hayError = true;
        }

        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!regexEmail.test(email)) {
            errorTemp.email = "Formato de correo inválido.";
            hayError = true;
        }

        const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (password.length < 8 || password.length > 16 || !symbolRegex.test(password)) {
            errorTemp.password = "8-16 caracteres + 1 símbolo.";
            hayError = true;
        }

        setErrores(errorTemp);
        if (hayError) return;

        try {
            await axios.post(`${API_URL}/auth/register`, { 
                nombre, 
                email: email.toLowerCase(), 
                password 
            });
            alert("✅ ¡Cuenta creada con éxito!");
            navigate('/login');
        } catch (err) {
            setErrores({ ...errorTemp, email: err.response?.data?.msg || "Error al registrar" });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    {/* LOGO ELIMINADO */}
                    <h2>Crear Cuenta</h2>
                    <p>Comienza a usar <strong>Bachito</strong></p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="input-group">
                        <label>Nombre Completo</label>
                        <input 
                            className={errores.nombre ? "input-error" : ""}
                            type="text" 
                            placeholder="Ej. Juan Pérez" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                        />
                        {errores.nombre && <span className="error-text">{errores.nombre}</span>}
                    </div>
                    
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <input 
                            className={errores.email ? "input-error" : ""}
                            type="email" 
                            placeholder="usuario@correo.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                        {errores.email && <span className="error-text">{errores.email}</span>}
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            className={errores.password ? "input-error" : ""}
                            type="password" 
                            placeholder="Mín. 8 caracteres + símbolo" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        {errores.password && <span className="error-text">{errores.password}</span>}
                    </div>

                    <button type="submit" className="btn-primary-auth">REGISTRARSE</button>
                </form>

                <div className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;