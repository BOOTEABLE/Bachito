import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';
import { API_URL } from '../config';
import { getDistanciaMetros } from '../utils/gpsHelpers';

// ICONOS
const bacheIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => { map.setView(coords); }, [coords, map]);
    return null;
}

function MapaPage({ darkMode }) {
    const [baches, setBaches] = useState([]);
    const [userPos, setUserPos] = useState([-0.1807, -78.4678]);
    const [bacheCercano, setBacheCercano] = useState(null);

    const rolUsuario = localStorage.getItem('userRole') || 'usuario';

    // 🔹 GPS
    useEffect(() => {
        const watch = navigator.geolocation.watchPosition(
            pos => {
                setUserPos([pos.coords.latitude, pos.coords.longitude]);
            },
            err => console.error(err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watch);
    }, []);

    // 🔹 Obtener baches
    const obtenerDatos = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/sensores`);
            const datos = res.data.reverse();
            setBaches(datos);

            const ultimo = datos[0];

            // MODO EXPLORADOR
            if (
                rolUsuario === 'explorador' &&
                ultimo &&
                ultimo.bache &&
                ultimo.lat === 0
            ) {
                navigator.geolocation.getCurrentPosition(async pos => {
                    await axios.patch(`${API_URL}/api/sensores/${ultimo._id}`, {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        obtenerDatos();
        const i = setInterval(obtenerDatos, 2000);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="app-container">
            <MapContainer center={userPos} zoom={18} style={{ height: '100vh' }}>
                <TileLayer
                    url={
                        darkMode
                            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                    }
                />
                <RecenterMap coords={userPos} />

                <Marker position={userPos}>
                    <Popup>📍 Tu ubicación</Popup>
                </Marker>

                {baches.filter(b => b.bache).map(b => (
                    <Marker
                        key={b._id}
                        position={[
                            b.lat !== 0 ? b.lat : userPos[0],
                            b.lng !== 0 ? b.lng : userPos[1],
                        ]}
                        icon={bacheIcon}
                    >
                        <Popup>
                            <b>Bache detectado</b><br />
                            Profundidad: {b.distancia} cm
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default MapaPage;
