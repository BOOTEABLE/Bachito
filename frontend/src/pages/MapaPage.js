// UBICACIÓN: src/pages/MapaPage.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css'; 
import { API_URL } from '../config';
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

    // 1. GPS Y PROXIMIDAD
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, heading: gpsHeading } = pos.coords;
                setUserPos([latitude, longitude]);
                if (gpsHeading !== null && !isNaN(gpsHeading)) setHeading(gpsHeading);

                // Lógica de cercanía
                const peligros = baches.filter(b => b.bache);
                let bacheEncontrado = null;
                let menorDistancia = 10000;

                peligros.forEach(bache => {
                    // Solo calculamos distancia si el bache YA TIENE ubicación real
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
            (err) => console.error("Error GPS:", err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [baches]);

    // 2. OBTENER DATOS (EL CEREBRO DEL SISTEMA)
    const obtenerDatos = async () => {
        try {
            const rolUsuario = localStorage.getItem('rolUsuario') || 'usuario'; 

            const res = await axios.get(`http://192.168.3.52:4000/api/sensores`);
            
            // ✅ CLAVE: Invertimos para que el [0] sea el NUEVO
            const datos = res.data.reverse(); 
            
            setBaches(datos);

            const ultimoBache = datos[0]; 
            
            // --- LÓGICA DE EXPLORADOR ---
            // Si soy explorador Y hay bache nuevo Y no tiene ubicación (lat=0)
            if (rolUsuario === 'explorador' && ultimoBache && ultimoBache.bache && ultimoBache.lat === 0) {
                
                console.log("🕵️‍♂️ MODO EXPLORADOR: Asignando GPS a nuevo bache...");

                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // Actualizamos visualmente mi posición
                    setUserPos([latitude, longitude]); 

                    try {
                        // Enviamos coordenadas al servidor
                        await axios.patch(`http://192.168.3.52:4000/api/sensores/${ultimoBache._id}`, {
                            lat: latitude, lng: longitude
                        });
                        console.log("📍 ¡Ubicación guardada en la Nube!");
                    } catch (err) { console.error("Error guardando GPS:", err); }
                });

            } else if (rolUsuario === 'usuario' && ultimoBache && ultimoBache.lat === 0) {
                console.log("🚗 MODO USUARIO: Veo un bache nuevo, pero espero a un Explorador.");
            }

        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        obtenerDatos();
        const interval = setInterval(obtenerDatos, 2000); // Actualiza cada 2 seg
        return () => clearInterval(interval);
    }, []);

    // --- LÓGICA DE ALERTAS ---
    const umbralAdmin = parseInt(localStorage.getItem('umbralBache')) || 20;
    const bacheActivo = bacheCercano;
    const esPeligroso = bacheActivo && (bacheActivo.distancia >= umbralAdmin);
    const mostrarAlerta = bacheActivo && (bacheActivo._id !== bacheIgnorado) && esPeligroso;

    const manejarIgnorar = (id) => {
        setBacheIgnorado(id);
        localStorage.setItem('bacheIgnorado', id);
        setBacheCercano(null);
    };

    return (
      <div className="app-container">
        <MapContainer center={userPos} zoom={18} zoomControl={false} style={{ height: "100vh", width: "100%" }}>
          <TileLayer 
            url={darkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            } 
          />
          <RecenterMap coords={userPos} />
          
          {/* MARCADOR DEL USUARIO (FLECHA) */}
          <Marker position={userPos} icon={createNavIcon(heading)} zIndexOffset={1000} />
          
          {/* MARCADORES DE BACHES */}
          {baches.filter(b => b.bache).map(b => (
              <Marker 
                key={b._id} 
                // ✅ TRUCO VISUAL: 
                // Si el bache se está creando (lat 0), lo pintamos donde estás TÚ.
                // Si ya existe (lat real), lo pintamos en su sitio.
                position={[
                    (b.lat !== 0) ? b.lat : userPos[0], 
                    (b.lng !== 0) ? b.lng : userPos[1]
                ]} 
                icon={bacheIcon} 
              >
                  <Popup>
                      <div style={{textAlign: 'center'}}>
                          <b>⚠️ Bache Detectado</b><br/>
                          Profundidad: <b>{b.distancia} cm</b><br/>
                          <small>{b.lat === 0 ? "📍 Sincronizando GPS..." : "✅ Ubicación Confirmada"}</small>
                      </div>
                  </Popup>
              </Marker>
          ))}
        </MapContainer>

        {/* --- TARJETA DE ALERTA ROJA --- */}
        {mostrarAlerta && (
          <div className="pothole-alert-card animate-pop">
              <div className="alert-header">
                <div className="live-pulse"></div>
                <span className="danger-title">PELIGRO DETECTADO</span>
              </div>
              
              <h2>Bache Profundo Adelante</h2>

              <div className="alert-data-container">
                  <div className="data-box depth-box">
                      <span className="data-label">Profundidad</span>
                      <span className="data-value red-glow">
                        {bacheActivo.distancia ? bacheActivo.distancia : '--'}
                        <small>cm</small>
                      </span>
                  </div>

                  {bacheCercano && (
                  <div className="data-box distance-box">
                      <span className="data-label">Impacto en</span>
                      <span className="data-value orange-glow">
                        {distanciaRestante}
                        <small>m</small>
                      </span>
                  </div>
                  )}
              </div>

              <div className="card-actions">
                  <button className="btn-omitir" onClick={() => {
                      if (bacheActivo) manejarIgnorar(bacheActivo._id);
                  }}>OMITIR</button>

                  <button className="btn-confirmar" onClick={() => {
                      if (bacheActivo) {
                          alert("✅ ¡Gracias por confirmar!");
                          manejarIgnorar(bacheActivo._id);
                      }
                  }}>CONFIRMAR</button>
              </div>
          </div>
        )}
      </div>
    );
}

export default MapaPage;