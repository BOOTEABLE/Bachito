import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';

function Navigation() {
    const location = useLocation();
    const role = localStorage.getItem('userRole'); 

    return (
        <nav className="bottom-nav">
            {/* Botón Mapa */}
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <div className="nav-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <span className="nav-label">Mapa</span>
            </Link>

            {/* Botón Admin - Solo para Jefes */}
            {role === 'admin' && (
                <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="nav-label">Admin</span>
                </Link>
            )}

            {/* Botón Ajustes */}
            <Link to="/config" className={`nav-item ${location.pathname === '/config' ? 'active' : ''}`}>
                <div className="nav-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="2"/>
                    </svg>
                </div>
                <span className="nav-label">Ajustes</span>
            </Link>
        </nav>
    );
}

export default Navigation;