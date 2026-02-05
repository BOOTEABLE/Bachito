// UBICACIÓN: src/pages/ConfigPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // <--- IMPORTANTE: Necesitamos axios para pedir los datos
import '../App.css'; 

function ConfigPage({ darkMode, setDarkMode }) {
    // Estados del usuario
    const [nombre, setNombre] = useState(localStorage.getItem('userName') || '');
    const [vehiculo, setVehiculo] = useState(localStorage.getItem('userVehicle') || 'auto');
    const [sonido, setSonido] = useState(true);

    // ESTADOS PARA DATOS REALES DEL HARDWARE
    const [stats, setStats] = useState({
        reportes: 0,
        km: 0
    });

    // --- EFECTO: CARGAR DATOS REALES DEL SERVIDOR ---
    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                // Obtenemos la IP guardada o usamos localhost
                const ip = localStorage.getItem('serverIp') || 'localhost';
                const url = `http://${ip}:4000/api/sensores`; // Asegúrate que el puerto sea el de tu backend (4000 o 3000)

                const res = await axios.get(url);
                const datos = res.data;

                // 1. CALCULAR REPORTES (Cuántos baches reales ha detectado el hardware)
                const totalBaches = datos.filter(dato => dato.bache === true).length;

                // 2. CALCULAR KM (Estimación basada en la actividad del hardware)
                // Asumimos que cada dato enviado (cada 2 seg) equivale a 0.02 km recorridos aprox.
                // O puedes usar la cantidad de datos totales como "tiempo de uso"
                const kmEstimados = (datos.length * 0.02).toFixed(1); 

                setStats({
                    reportes: totalBaches,
                    km: kmEstimados
                });

            } catch (error) {
                console.error("Error cargando estadísticas:", error);
                // Si falla, dejamos 0 o cargamos del localStorage si quisieras
            }
        };

        cargarEstadisticas();
    }, []);

    // Guardar nombre
    const handleNameChange = (e) => {
        setNombre(e.target.value);
        localStorage.setItem('userName', e.target.value);
    };

    // Guardar vehículo
    const handleVehicleChange = (val) => {
        setVehiculo(val);
        localStorage.setItem('userVehicle', val);
    };

    return (
        <div className={`config-page ${darkMode ? 'dark' : 'light'}`}>
            
            {/* CABECERA DE PERFIL */}
            <div className="profile-header">
                <div className="avatar-circle">
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
                    <p className="profile-level">Explorador Nivel {stats.reportes > 5 ? '2' : '1'}</p>
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

            {/* SECCIÓN 3: ESTADÍSTICAS REALES DEL HARDWARE */}
            <div className="stats-card">
                <div className="stat-item">
                    {/* AQUI MOSTRAMOS LOS DATOS REALES */}
                    <span className="stat-number">{stats.reportes}</span>
                    <span className="stat-label">Baches Reportados</span>
                </div>
                <div className="stat-line"></div>
                <div className="stat-item">
                    {/* AQUI MOSTRAMOS LOS KM ESTIMADOS */}
                    <span className="stat-number">{stats.km}km</span>
                    <span className="stat-label">Recorridos</span>
                </div>
            </div>

            <p className="app-version">Bachito v1.0 - Proyecto</p>
        </div>
    );
}

export default ConfigPage;