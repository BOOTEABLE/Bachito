// UBICACIÓN: src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importamos las páginas
import MapaPage from './pages/MapaPage';
import ConfigPage from './pages/ConfigPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import Navigation from './components/Navigation';
import './App.css';

// --- GUARDIA DE SEGURIDAD ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole'); 
  return (token && role === 'admin') ? children : <Navigate to="/" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(true);

  // 🛰️ ESTADOS GLOBALES DE UBICACIÓN (El motor de Oráculo)
  const [globalUserPos, setGlobalUserPos] = useState([-0.1807, -78.4678]);
  const [globalHeading, setGlobalHeading] = useState(0);
  const [gpsError, setGpsError] = useState(false);

  // 🔄 RASTREADOR EN VIVO (Nunca se detiene al cambiar de pestaña)
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError(true);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
          setGpsError(false);
          const { latitude, longitude, heading } = pos.coords;
          
          // Calculamos si el movimiento es real (usando una pequeña diferencia)
          const latDiff = Math.abs(globalUserPos[0] - latitude);
          const lngDiff = Math.abs(globalUserPos[1] - longitude);

          // Solo actualizamos si el cambio es mayor a un umbral mínimo (aprox 1-2 metros)
          if (latDiff > 0.00001 || lngDiff > 0.00001) {
              setGlobalUserPos([latitude, longitude]);
          }
          
          if (heading !== null && !isNaN(heading)) {
              setGlobalHeading(heading);
          }
      },
      (err) => {
        console.error("Error GPS Global:", err);
        setGpsError(true);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 // Garantiza que siempre sea la ubicación del SEGUNDO actual
      }
    );

    // Limpieza al cerrar la app
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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

          {/* --- RUTAS PRIVADAS CON GPS EN VIVO --- */}
          
          {/* MAPA: Recibe la posición global como "props" */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <MapaPage 
                  darkMode={darkMode} 
                  userPos={globalUserPos} 
                  heading={globalHeading}
                  gpsError={gpsError}
                />
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

          {/* PANEL ADMIN */}
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