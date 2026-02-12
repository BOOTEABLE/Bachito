// UBICACIÓN: src/pages/MapaPage.js
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
    className: 'nav-icon',
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

// 🎯 RECENTRO FLUIDO: Usa flyTo para que el mapa se deslice suavemente
function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => { 
        // Usamos panTo en lugar de flyTo para movimientos cortos
        // Esto elimina el "rebote" o temblor
        map.panTo(coords, {
            animate: true,
            duration: 0.5 // Duración mucho más corta
        }); 
    }, [coords, map]);
    return null;
}

// ✅ RECIBIMOS userPos, heading y gpsError desde App.js
function MapaPage({ darkMode, userPos, heading, gpsError }) {
    const [baches, setBaches] = useState([]);
    const [bacheIgnorado, setBacheIgnorado] = useState(localStorage.getItem('bacheIgnorado') || null);
    const [bacheCercano, setBacheCercano] = useState(null);
    const [distanciaRestante, setDistanciaRestante] = useState(0);

    // 1. LÓGICA DE PROXIMIDAD (Se actualiza cada vez que recibimos nueva userPos de App.js)
    useEffect(() => {
        const peligros = baches.filter(b => b.bache);
        let bacheEncontrado = null;
        let menorDistancia = 10000;

        peligros.forEach(bache => {
            if (bache.lat !== 0 && bache.lng !== 0) {
                const dist = getDistanciaMetros(userPos[0], userPos[1], bache.lat, bache.lng);
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

    // 2. OBTENER DATOS DEL BACKEND
    const obtenerDatos = async () => {
        try {
            const res = await axios.get(`http://192.168.3.52:4000/api/sensores`);
            const datos = res.data.reverse(); 
            setBaches(datos);
            
            const ultimoBache = datos[0]; 
            const rolUsuario = localStorage.getItem('rolUsuario') || 'usuario';

            // MODO EXPLORADOR: Si hay bache sin GPS, usamos la userPos que viene de App.js
            if (rolUsuario === 'explorador' && ultimoBache && ultimoBache.bache && ultimoBache.lat === 0) {
                try {
                    await axios.patch(`http://192.168.3.52:4000/api/sensores/${ultimoBache._id}`, {
                        lat: userPos[0], lng: userPos[1]
                    });
                    console.log("📍 Ubicación asignada automáticamente al bache");
                } catch (err) { console.error("Error guardando GPS del bache:", err); }
            }
        } catch (err) { console.error("Error obteniendo baches:", err); }
    };

    // PEGA ESTE BLOQUE:
    useEffect(() => {
        obtenerDatos();
        const interval = setInterval(obtenerDatos, 5000); // 5 seg es más estable
        return () => clearInterval(interval);
        // Dejamos el arreglo vacío [] para que se ejecute una sola vez al cargar.
        // Los baches se actualizarán por el reloj del setInterval, no por tu GPS.
    }, []);

    // --- MANEJO DE ALERTAS ---
    const bacheActivo = bacheCercano;
    const umbralAdmin = parseInt(localStorage.getItem('umbralBache')) || 20;
    const mostrarAlerta = bacheActivo && (bacheActivo._id !== bacheIgnorado) && (bacheActivo.distancia >= umbralAdmin);

    const manejarIgnorar = (id) => {
        setBacheIgnorado(id);
        localStorage.setItem('bacheIgnorado', id);
        setBacheCercano(null);
    };

    return (
      <div className="app-container">
        {/* Overlay de GPS si hay error global */}
        {gpsError && (
            <div className="gps-alert-overlay">
                <div className="gps-alert-content">
                    📍 <h3>GPS Requerido</h3>
                    <p>La aplicación necesita tu ubicación en vivo para funcionar.</p>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </div>
        )}

        <MapContainer center={userPos} zoom={18} zoomControl={false} style={{ height: "100vh", width: "100%" }}>
          <TileLayer 
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" 
            attribution='&copy; Google Maps'
          />
          
          <RecenterMap coords={userPos} />
          
          {/* Marcador de usuario con heading de App.js */}
          <Marker position={userPos} icon={createNavIcon(heading)} zIndexOffset={1000} />
          
          {/* Marcadores de baches */}
          {baches.filter(b => b.bache).map(b => (
              <Marker 
                key={b._id} 
                position={[(b.lat !== 0) ? b.lat : userPos[0], (b.lng !== 0) ? b.lng : userPos[1]]} 
                icon={bacheIcon} 
              >
                <Popup>
                    <div style={{textAlign: 'center'}}>
                        <b>⚠️ Bache Detectado</b><br/>
                        Profundidad: <b>{b.distancia} cm</b>
                    </div>
                </Popup>
              </Marker>
          ))}
        </MapContainer>

        {/* ALERTA DE PELIGRO */}
        {mostrarAlerta && (
          <div className="pothole-alert-card animate-pop">
              <span className="danger-title">🔴 PELIGRO ADELANTE</span>
              <h2>Bache Profundo</h2>
              <div className="alert-data-container">
                  <div className="data-box">
                      <span className="data-label">Profundidad</span>
                      <span className="data-value">{bacheActivo.distancia} cm</span>
                  </div>
                  <div className="data-box">
                      <span className="data-label">Impacto en</span>
                      <span className="data-value">{distanciaRestante} m</span>
                  </div>
              </div>
              <div className="card-actions">
                  <button className="btn-omitir" onClick={() => manejarIgnorar(bacheActivo._id)}>OMITIR</button>
                  <button className="btn-confirmar" onClick={() => { alert("✅ Confirmado"); manejarIgnorar(bacheActivo._id); }}>CONFIRMAR</button>
              </div>
          </div>
        )}
      </div>
    );
}

export default MapaPage;