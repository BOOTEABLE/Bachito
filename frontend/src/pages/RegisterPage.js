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
    
    // Estado para mensajes de error específicos
    const [errores, setErrores] = useState({ nombre: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        let errorTemp = { nombre: '', email: '', password: '' };
        let hayError = false;

        // --- VALIDAR NOMBRE (Mínimo 3, Máximo 20) ---
        if (nombre.length < 3) {
            errorTemp.nombre = "El nombre debe tener al menos 3 letras.";
            hayError = true;
        } else if (nombre.length > 20) {
            errorTemp.nombre = "El nombre no puede exceder las 20 letras.";
            hayError = true;
        }

        // --- VALIDAR CORREO ---
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!regexEmail.test(email)) {
            errorTemp.email = "Formato de correo inválido.";
            hayError = true;
        }

        // --- VALIDAR CONTRASEÑA (8-16 caracteres + Símbolo) ---
        const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
        if (password.length < 8) {
            errorTemp.password = "Mínimo 8 caracteres.";
            hayError = true;
        } else if (password.length > 16) {
            errorTemp.password = "Máximo 16 caracteres.";
            hayError = true;
        } else if (!symbolRegex.test(password)) {
            errorTemp.password = "Debe incluir al menos un símbolo (ej: @, #, $).";
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
            // Captura errores del backend (ej: correo ya registrado)
            setErrores({ 
                ...errorTemp, 
                email: err.response?.data?.msg || "Error al registrar la cuenta" 
            });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <p>Únete a la comunidad de Bachito</p>
                <form onSubmit={handleRegister}>
                    <label>Nombre Completo</label>
                    <input 
                        type="text" 
                        placeholder="Mín. 3 - Máx. 20 letras" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        required 
                    />
                    {errores.nombre && <span className="error-text">{errores.nombre}</span>}
                    
                    <label>Correo Electrónico</label>
                    <input 
                        type="email" 
                        placeholder="ejemplo@correo.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    {errores.email && <span className="error-text">{errores.email}</span>}

                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        placeholder="8-16 caracteres + símbolo" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    {errores.password && <span className="error-text">{errores.password}</span>}

                    <button type="submit" className="btn-auth secondary">REGISTRARSE</button>
                </form>
                <div className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;