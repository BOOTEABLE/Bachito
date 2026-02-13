// UBICACIÓN: src/pages/ConfigPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import { API_URL } from '../config'; 
import '../App.css'; 

function ConfigPage({ darkMode, setDarkMode }) {
    const navigate = useNavigate(); // 2. Inicializar navegación

    const [nombre, setNombre] = useState(localStorage.getItem('userName') || '');
    const [vehiculo, setVehiculo] = useState(localStorage.getItem('userVehicle') || 'auto');
    const [sonido, setSonido] = useState(true);
    const [esExplorador, setEsExplorador] = useState(false);
    const [stats, setStats] = useState({
        reportes: 0,
        km: 0
    });

    useEffect(() => {
        const rolActual = localStorage.getItem('rolUsuario');
        setEsExplorador(rolActual === 'explorador');

        const cargarEstadisticas = async () => {
            try {
                const res = await axios.get(`${API_URL}/sensores`);
                const datos = res.data;
                const totalBaches = datos.filter(dato => dato.bache === true).length;
                const kmEstimados = (datos.length * 0.02).toFixed(1); 

                setStats({
                    reportes: totalBaches,
                    km: kmEstimados
                });
            } catch (error) {
                console.error("Error cargando estadísticas:", error);
            }
        };
        cargarEstadisticas();
    }, []);

    // --- 3. FUNCIÓN DE CERRAR SESIÓN ---
    const cerrarSesion = () => {
        if (window.confirm("¿Estás seguro de que quieres salir?")) {
            localStorage.clear(); // Borra token, nombre, rol y todo el caché
            navigate('/login'); // Redirige al inicio de sesión
        }
    };

    const cambiarRol = () => {
        if (esExplorador) {
            localStorage.setItem('rolUsuario', 'usuario');
            setEsExplorador(false);
            alert("🔒 MODO USUARIO ACTIVADO");
        } else {
            localStorage.setItem('rolUsuario', 'explorador');
            setEsExplorador(true);
            alert("🕵️‍♂️ MODO EXPLORADOR ACTIVADO");
        }
    };

    const handleNameChange = (e) => {
        setNombre(e.target.value);
        localStorage.setItem('userName', e.target.value);
    };

    const handleVehicleChange = (val) => {
        setVehiculo(val);
        localStorage.setItem('userVehicle', val);
    };

    return (
        <div className={`config-page ${darkMode ? 'dark' : 'light'}`} style={{ paddingBottom: '80px' }}>
            
            {/* CABECERA DE PERFIL */}
            <div className="profile-header">
                <div className={`avatar-circle ${esExplorador ? 'border-green' : ''}`}>
                    {nombre ? nombre.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="profile-info">
                    <input 
                        type="text" 
                        value={nombre}
                        onChange={handleNameChange}
                        className="profile-name-input"
                    />
                    <p className="profile-level" style={{ color: esExplorador ? '#4ade80' : '#94a3b8' }}>
                        {esExplorador ? '🛠️ Técnico Oficial' : '🚗 Conductor Ciudadano'}
                    </p>
                </div>
            </div>

            {/* GESTIÓN DE ROLES */}
            <div className="settings-section">
                <h3>🪪 Identidad del Dispositivo</h3>
                <div className="card-rol" style={{ 
                    padding: '20px', 
                    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                    border: esExplorador ? '2px solid #22c55e' : '1px solid #475569',
                    borderRadius: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: 'white' }}>{esExplorador ? 'MODO EXPLORADOR' : 'MODO USUARIO'}</h4>
                    </div>
                    <button onClick={cambiarRol} className="btn-rol-toggle">
                        {esExplorador ? 'Desactivar Permisos' : 'Activar Modo Técnico'}
                    </button>
                </div>
            </div>

            {/* PREFERENCIAS */}
            <div className="settings-section">
                <h3>⚙️ Preferencias</h3>
                <div className="setting-item">
                    <span>🌙 Modo Oscuro</span>
                    <label className="switch">
                        <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="stats-card">
                <div className="stat-item">
                    <span className="stat-number">{stats.reportes}</span>
                    <span className="stat-label">Baches Reportados</span>
                </div>
                <div className="stat-line"></div>
                <div className="stat-item">
                    <span className="stat-number">{stats.km}km</span>
                    <span className="stat-label">Recorridos</span>
                </div>
            </div>

            {/* --- 4. BOTÓN CERRAR SESIÓN --- */}
            <div style={{ padding: '0 20px', marginTop: '30px' }}>
                <button 
                    onClick={cerrarSesion}
                    className="btn-logout"
                >
                    🚪 Cerrar Sesión
                </button>
            </div>

            <p className="app-version">Bachito Vial v1.0 - Proyecto Tesis</p>
        </div>
    );
}

export default ConfigPage;