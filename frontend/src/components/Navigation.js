// UBICACIÓN: src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css'; // Asegúrate de importar tus estilos

function Navigation() {
    const location = useLocation();
    
    // 👇 1. AQUÍ LEEMOS SI ES JEFE O NO (Antes del return)
    const role = localStorage.getItem('userRole'); 

    return (
        <nav className="bottom-nav">
            {/* Botón Mapa */}
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <span className="nav-icon">🗺️</span>
                <span className="nav-label">Mapa</span>
            </Link>

            {/* 👇 2. AQUÍ AGREGAMOS EL BOTÓN DE ADMIN (Solo sale si es admin) */}
            {role === 'admin' && (
                <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                    <span className="nav-icon">🛡️</span>
                    <span className="nav-label">Admin</span>
                </Link>
            )}

            {/* Botón Configuración */}
            <Link to="/config" className={`nav-item ${location.pathname === '/config' ? 'active' : ''}`}>
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Ajustes</span>
            </Link>
        </nav>
    );
}

export default Navigation;