// UBICACIÓN: src/pages/ConfigPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config'; // Usamos la configuración centralizada
import '../App.css'; 

function ConfigPage({ darkMode, setDarkMode }) {
    // --- ESTADOS ---
    const [nombre, setNombre] = useState(localStorage.getItem('userName') || '');
    const [vehiculo, setVehiculo] = useState(localStorage.getItem('userVehicle') || 'auto');
    const [sonido, setSonido] = useState(true);
    const [esExplorador, setEsExplorador] = useState(false); // Nuevo estado para el rol
    const [stats, setStats] = useState({
        reportes: 0,
        km: 0
    });

    // --- EFECTO 1: CARGAR ESTADÍSTICAS Y ROL AL INICIAR ---
    useEffect(() => {
        // A. Cargar Rol
        const rolActual = localStorage.getItem('rolUsuario');
        setEsExplorador(rolActual === 'explorador');

        // B. Cargar Estadísticas del Servidor
        const cargarEstadisticas = async () => {
            try {
                // Usamos API_URL que viene de config.js (ya tiene la IP correcta)
                const res = await axios.get(`${API_URL}/sensores`);
                const datos = res.data;

                // Calculamos datos
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

    // --- FUNCIONES DE CAMBIO ---

    // 1. Cambiar Rol (Explorador / Usuario)
    const cambiarRol = () => {
        if (esExplorador) {
            localStorage.setItem('rolUsuario', 'usuario');
            setEsExplorador(false);
            alert("🔒 MODO USUARIO ACTIVADO\n\nAhora solo podrás VER los baches. Tu GPS no modificará la base de datos.");
        } else {
            localStorage.setItem('rolUsuario', 'explorador');
            setEsExplorador(true);
            alert("🕵️‍♂️ MODO EXPLORADOR ACTIVADO\n\n¡Cuidado! Ahora tu GPS se vinculará a los sensores nuevos. Úsalo solo en el vehículo de pruebas.");
        }
    };

    // 2. Cambiar Nombre
    const handleNameChange = (e) => {
        setNombre(e.target.value);
        localStorage.setItem('userName', e.target.value);
    };

    // 3. Cambiar Vehículo
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
                        placeholder="Tu Nombre" 
                        value={nombre}
                        onChange={handleNameChange}
                        className="profile-name-input"
                    />
                    <p className="profile-level" style={{ color: esExplorador ? '#4ade80' : '#94a3b8' }}>
                        {esExplorador ? '🛠️ Técnico Oficial' : '🚗 Conductor Ciudadano'}
                    </p>
                </div>
            </div>

            {/* --- NUEVA SECCIÓN: GESTIÓN DE ROLES --- */}
            <div className="settings-section">
                <h3>🪪 Identidad del Dispositivo</h3>
                <div className="card-rol" style={{ 
                    padding: '20px', 
                    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                    border: esExplorador ? '2px solid #22c55e' : '1px solid #475569',
                    borderRadius: '15px',
                    marginBottom: '20px',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: 'white' }}>
                            {esExplorador ? 'MODO EXPLORADOR' : 'MODO USUARIO'}
                        </h4>
                        <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '11px',
                            backgroundColor: esExplorador ? '#22c55e' : '#64748b',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            {esExplorador ? 'ACTIVO' : 'PASIVO'}
                        </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '15px', lineHeight: '1.4' }}>
                        {esExplorador 
                            ? "✅ Tu GPS registrará automáticamente la ubicación de nuevos baches detectados."
                            : "👁️ Tu dispositivo solo recibe alertas. No afecta la base de datos."
                        }
                    </p>
                    
                    <button 
                        onClick={cambiarRol}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: esExplorador ? 'rgba(34, 197, 94, 0.2)' : '#3b82f6',
                            color: esExplorador ? '#4ade80' : 'white',
                            border: esExplorador ? '1px solid #22c55e' : 'none'
                        }}
                    >
                        {esExplorador ? 'Desactivar Permisos' : 'Activar Modo Técnico'}
                    </button>
                </div>
            </div>

            {/* SECCIÓN 1: MI VEHÍCULO */}
            <div className="settings-section">
                <h3>🚗 Mi Vehículo</h3>
                <div className="vehicle-selector">
                    <button 
                        className={`vehicle-btn ${vehiculo === 'auto' ? 'selected' : ''}`}
                        onClick={() => handleVehicleChange('auto')}
                    >
                        🚘 Auto
                    </button>
                    <button 
                        className={`vehicle-btn ${vehiculo === 'moto' ? 'selected' : ''}`}
                        onClick={() => handleVehicleChange('moto')}
                    >
                        🏍️ Moto
                    </button>
                </div>
            </div>

            {/* SECCIÓN 2: PREFERENCIAS */}
            <div className="settings-section">
                <h3>⚙️ Preferencias</h3>
                
                {/* MODO NOCHE */}
                <div className="setting-item">
                    <div className="setting-label">
                        <span>🌙 Modo Oscuro</span>
                        <small>Interfaz oscura para conducir</small>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={darkMode} 
                            onChange={() => setDarkMode(!darkMode)} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                {/* SONIDO */}
                <div className="setting-item">
                    <div className="setting-label">
                        <span>🔊 Alertas de Voz</span>
                        <small>Avisar baches cercanos</small>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={sonido} 
                            onChange={() => setSonido(!sonido)} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* SECCIÓN 3: ESTADÍSTICAS REALES */}
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

            <p className="app-version">Oráculo Vial v1.0 - Proyecto Tesis</p>
        </div>
    );
}

export default ConfigPage;