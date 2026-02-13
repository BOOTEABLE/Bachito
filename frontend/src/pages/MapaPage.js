import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css'; 
import { getDistanciaMetros } from '../utils/gpsHelpers';

// --- ICONOS ---
const bacheIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const createNavIcon = (heading) => {
  return L.divIcon({
    className: 'nav-icon-container',
    html: `
      <div style="transform: rotate(${heading}deg); width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; transition: transform 0.3s ease;">
        <svg viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
          <path d="M12 2L2 22L12 18L22 22L12 2Z" />
        </svg>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => { 
        map.panTo(coords, { animate: true, duration: 0.5 }); 
    }, [coords, map]);
    return null;
}

function MapaPage({ darkMode, userPos, heading, gpsError }) {
    const [baches, setBaches] = useState([]);
    const [bacheIgnorado, setBacheIgnorado] = useState(localStorage.getItem('bacheIgnorado') || null);
    const [bacheCercano, setBacheCercano] = useState(null);
    const [distanciaRestante, setDistanciaRestante] = useState(0);

    // 1. OBTENER DATOS Y MODO EXPLORADOR
    const obtenerDatos = async () => {
        try {
            const res = await axios.get(`http://bachito.duckdns.org:4000/api/sensores`);
            const datos = res.data.reverse(); 
            setBaches(datos);
            
            const ultimoBache = datos[0]; 
            const rolUsuario = localStorage.getItem('userRole') || 'usuario';

            // ASIGNACIÓN DE GPS AUTOMÁTICA
            if (rolUsuario === 'explorador' && ultimoBache && ultimoBache.bache && (ultimoBache.lat === 0 || !ultimoBache.lat)) {
                try {
                    await axios.patch(`http://bachito.duckdns.org:4000/api/sensores/${ultimoBache._id}`, {
                        lat: userPos[0], lng: userPos[1]
                    });
                    console.log("📍 GPS asignado al bache");
                } catch (err) { console.error("Error actualizando GPS:", err); }
            }
        } catch (err) { console.error("Error obteniendo baches:", err); }
    };

    useEffect(() => {
        obtenerDatos();
        const interval = setInterval(obtenerDatos, 4000); 
        return () => clearInterval(interval);
    }, [userPos]); // Se refresca si te mueves para el modo explorador

    // 2. LÓGICA DE PROXIMIDAD (Dispara la alerta roja)
    useEffect(() => {
        const peligros = baches.filter(b => b.bache && b.estado !== 'reparado');
        let bacheEncontrado = null;
        let menorDistancia = 10000;

        peligros.forEach(bache => {
            if (bache.lat !== 0 && bache.lng !== 0) {
                const dist = getDistanciaMetros(userPos[0], userPos[1], bache.lat, bache.lng);
                // Si está a menos de 30 metros, es peligro inminente
                if (dist < 30 && dist < menorDistancia) { 
                    menorDistancia = dist;
                    bacheEncontrado = bache;
                }
            }
        });

        if (bacheEncontrado) {
            setDistanciaRestante(Math.round(menorDistancia));
            setBacheCercano(bacheEncontrado);
        } else {
            setBacheCercano(null);
        }
    }, [baches, userPos]);

    const manejarIgnorar = (id) => {
        setBacheIgnorado(id);
        localStorage.setItem('bacheIgnorado', id);
        setBacheCercano(null);
    };

    // Condiciones para mostrar la tarjeta roja
    const umbralAdmin = parseInt(localStorage.getItem('umbralBache')) || 5; // Bajamos a 5 para pruebas
    const mostrarAlerta = bacheCercano && (bacheCercano._id !== bacheIgnorado) && (bacheCercano.distancia >= umbralAdmin);

    return (
      <div className="app-container">
        {gpsError && (
            <div className="gps-alert-overlay">
                <div className="gps-alert-content">
                    📍 <h3>GPS Requerido</h3>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </div>
        )}

        <MapContainer center={userPos} zoom={18} zoomControl={false} style={{ height: "100vh", width: "100%" }}>
          <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
          <RecenterMap coords={userPos} />
          <Marker position={userPos} icon={createNavIcon(heading)} zIndexOffset={1000} />
          
          {baches.filter(b => b.bache).map(b => (
              <Marker 
                key={b._id} 
                position={[b.lat !== 0 ? b.lat : userPos[0], b.lng !== 0 ? b.lng : userPos[1]]} 
                icon={bacheIcon} 
              >
                <Popup>
                    <div style={{textAlign: 'center'}}>
                        <b>⚠️ {b.estado === 'reparado' ? 'Reparado' : 'Bache Detectado'}</b><br/>
                        Profundidad: <b>{b.distancia} cm</b>
                    </div>
                </Popup>
              </Marker>
          ))}
        </MapContainer>

        {/* 👇 LA ALERTA ROJA (UI Profesional) */}
        {mostrarAlerta && (
          <div className="pothole-alert-card">
              <div className="alert-header">
                  <div className="live-pulse"></div>
                  <span className="danger-title">PELIGRO ADELANTE</span>
              </div>
              <h2>Bache Detectado</h2>
              <div className="alert-data-container">
                  <div className="data-box depth-box">
                      <span className="data-label">Profundidad</span>
                      <span className="data-value red-glow">{bacheCercano.distancia}<small>cm</small></span>
                  </div>
                  <div className="data-box distance-box">
                      <span className="data-label">Distancia</span>
                      <span className="data-value orange-glow">{distanciaRestante}<small>m</small></span>
                  </div>
              </div>
              <div className="card-actions">
                  <button className="btn-omitir" onClick={() => manejarIgnorar(bacheCercano._id)}>IGNORAR</button>
                  <button className="btn-confirmar" onClick={() => { alert("Reporte Confirmado"); manejarIgnorar(bacheCercano._id); }}>CONFIRMAR</button>
              </div>
          </div>
        )}
      </div>
    );
}

export default MapaPage;