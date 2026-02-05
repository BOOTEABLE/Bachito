// UBICACIÓN: src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importamos las páginas
import MapaPage from './pages/MapaPage';
import ConfigPage from './pages/ConfigPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage'; // 👈 1. IMPORTAR LA NUEVA PÁGINA
import Navigation from './components/Navigation';
import './App.css';

// --- GUARDIA DE SEGURIDAD NORMAL (Usuarios) ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// 👇 2. GUARDIA DE SEGURIDAD VIP (Administradores) ---
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole'); // Leemos el rol
  
  // Si tiene token Y es admin, pasa. Si no, lo mandamos al mapa normal (/)
  return (token && role === 'admin') ? children : <Navigate to="/" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(true);

  // Efecto visual del Body
  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#0b0e14';
      document.body.style.color = 'white';
    } else {
      document.body.style.backgroundColor = '#f3f4f6';
      document.body.style.color = '#1f2937';
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="app-main">
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- RUTAS PRIVADAS --- */}
          
          {/* MAPA */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <MapaPage darkMode={darkMode} />
                <Navigation />
              </PrivateRoute>
            } 
          />
          
          {/* CONFIGURACIÓN */}
          <Route 
            path="/config" 
            element={
              <PrivateRoute>
                <ConfigPage darkMode={darkMode} setDarkMode={setDarkMode} />
                <Navigation />
              </PrivateRoute>
            } 
          />

          {/* 👇 3. AQUÍ AGREGAMOS LA RUTA PROTEGIDA DE ADMIN */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPage />
                <Navigation />
              </AdminRoute>
            } 
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;