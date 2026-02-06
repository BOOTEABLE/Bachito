// UBICACIÓN: src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Páginas
import MapaPage from './pages/MapaPage';
import ConfigPage from './pages/ConfigPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';

// Componentes
import Navigation from './components/Navigation';
import './App.css';

/* =====================================================
   GUARDIAS DE SEGURIDAD (ROUTES PROTEGIDAS)
===================================================== */

// 🔐 Ruta privada general (cualquier usuario logueado)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// 🛡️ Ruta solo ADMIN
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  return (token && role === 'admin') ? children : <Navigate to="/" />;
};

// 🔍 Ruta solo EXPLORADOR
const ExplorerRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  return (token && role === 'explorador') ? children : <Navigate to="/" />;
};

/* =====================================================
   APP PRINCIPAL
===================================================== */

function App() {
  const [darkMode, setDarkMode] = useState(true);

  // 🎨 Efecto visual global
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0b0e14' : '#f3f4f6';
    document.body.style.color = darkMode ? 'white' : '#1f2937';
  }, [darkMode]);

  return (
    <Router>
      <div className="app-main">
        <Routes>

          {/* ================= RUTAS PÚBLICAS ================= */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ================= RUTAS PRIVADAS ================= */}

          {/* 🗺️ MAPA (USER / EXPLORADOR / ADMIN) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MapaPage darkMode={darkMode} />
                <Navigation />
              </PrivateRoute>
            }
          />

          {/* ⚙️ CONFIGURACIÓN (USER / EXPLORADOR / ADMIN) */}
          <Route
            path="/config"
            element={
              <PrivateRoute>
                <ConfigPage darkMode={darkMode} setDarkMode={setDarkMode} />
                <Navigation />
              </PrivateRoute>
            }
          />

          {/* 🔍 EXPLORADOR (opcional, si luego separas vistas) */}
          <Route
            path="/explorador"
            element={
              <ExplorerRoute>
                <ConfigPage darkMode={darkMode} setDarkMode={setDarkMode} />
                <Navigation />
              </ExplorerRoute>
            }
          />

          {/* 🛡️ ADMIN */}
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
