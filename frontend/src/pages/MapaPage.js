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

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => { map.setView(coords); }, [coords, map]);
    return null;
}

function MapaPage({ darkMode }) {
    const [baches, setBaches] = useState([]);
    const [userPos, setUserPos] = useState([-0.1807, -78.4678]); 
    const [heading, setHeading] = useState(0); 
    const [bacheIgnorado, setBacheIgnorado] = useState(localStorage.getItem('bacheIgnorado') || null);
    const [bacheCercano, setBacheCercano] = useState(null);
    const [distanciaRestante, setDistanciaRestante] = useState(0);
    
    // NUEVO: Estado para manejar errores de GPS
    const [gpsError, setGpsError] = useState(false);

    // 1. GPS Y PROXIMIDAD
    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsError(true);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setGpsError(false); // GPS funcionando bien
                const { latitude, longitude, heading: gpsHeading } = pos.coords;
                setUserPos([latitude, longitude]);
                if (gpsHeading !== null && !isNaN(gpsHeading)) setHeading(gpsHeading);

                const peligros = baches.filter(b => b.bache);
                let bacheEncontrado = null;
                let menorDistancia = 10000;

                peligros.forEach(bache => {
                    if (bache.lat !== 0 && bache.lng !== 0) {
                        const dist = getDistanciaMetros(latitude, longitude, bache.lat, bache.lng);
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
            },
            (err) => {
                console.error("Error GPS:", err);
                setGpsError(true); // El usuario denegó o el GPS está apagado
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [baches]);

    // 2. OBTENER DATOS
    const obtenerDatos = async () => {
        try {
            const rolUsuario = localStorage.getItem('rolUsuario') || 'usuario'; 
            // Recuerda cambiar esta IP por la de tu backend en AWS pronto
            const res = await axios.get(`http://192.168.3.52:4000/api/sensores`);
            const datos = res.data.reverse(); 
            setBaches(datos);
            const ultimoBache = datos[0]; 
            
            if (rolUsuario === 'explorador' && ultimoBache && ultimoBache.bache && ultimoBache.lat === 0) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    try {
                        await axios.patch(`http://192.168.3.52:4000/api/sensores/${ultimoBache._id}`, {
                            lat: latitude, lng: longitude
                        });
                        console.log("📍 Ubicación guardada!");
                    } catch (err) { console.error(err); }
                });
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        obtenerDatos();
        const interval = setInterval(obtenerDatos, 2000);
        return () => clearInterval(interval);
    }, []);

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
        
        {/* AVISO DE GPS DESACTIVADO */}
        {gpsError && (
            <div className="gps-alert-overlay">
                <div className="gps-alert-content">
                    📍 <h3>GPS Requerido</h3>
                    <p>Por favor, permite el acceso a tu ubicación para rastrear baches en tiempo real.</p>
                    <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </div>
        )}

        <MapContainer center={userPos} zoom={18} zoomControl={false} style={{ height: "100vh", width: "100%" }}>
          <TileLayer 
            url={darkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            } 
          />
          <RecenterMap coords={userPos} />
          <Marker position={userPos} icon={createNavIcon(heading)} zIndexOffset={1000} />
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

        {/* ALERTA ROJA */}
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