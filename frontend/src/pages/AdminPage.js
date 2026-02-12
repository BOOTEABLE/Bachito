// UBICACIÓN: src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { Bar } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, PointElement, LineElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ✅ Recibimos darkMode desde App.js
function AdminPage({ darkMode }) {
    const [baches, setBaches] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [view, setView] = useState('stats'); 
    const [busqueda, setBusqueda] = useState('');

    const cargarBaches = async () => {
        try {
            const res = await axios.get(`${API_URL}/sensores`);
            setBaches(res.data.reverse());
        } catch (err) { console.error("Error al cargar baches:", err); }
    };

    useEffect(() => { cargarBaches(); }, []);

    // --- ACCIONES DE GESTIÓN ---
    const marcarReparado = async (id) => {
        try {
            await axios.patch(`${API_URL}/sensores/${id}`, { estado: 'reparado' });
            setBaches(baches.map(b => b._id === id ? { ...b, estado: 'reparado' } : b));
        } catch (err) { alert("Error al actualizar"); }
    };

    const borrarBache = async (id) => {
        if (window.confirm("¿Eliminar reporte permanentemente?")) {
            try {
                await axios.delete(`${API_URL}/sensores/${id}`);
                setBaches(baches.filter(b => b._id !== id));
            } catch (err) { alert("Error al eliminar"); }
        }
    };

    // --- DATOS PARA GRÁFICOS ---
    const statsData = {
        pendientes: baches.filter(b => b.estado !== 'reparado').length,
        reparados: baches.filter(b => b.estado === 'reparado').length
    };

    const dataBar = {
        labels: ['Pendientes', 'Reparados'],
        datasets: [{
            data: [statsData.pendientes, statsData.reparados],
            backgroundColor: ['rgba(239, 68, 68, 0.7)', 'rgba(74, 222, 128, 0.7)'],
            borderColor: ['#ef4444', '#4ade80'],
            borderWidth: 2,
            borderRadius: 15,
            barThickness: 50,
        }]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: { borderRadius: 10 }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                grid: { color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, 
                ticks: { color: darkMode ? '#94a3b8' : '#475569' } 
            },
            x: { 
                grid: { display: false }, 
                ticks: { color: darkMode ? '#f8fafc' : '#1e293b', font: { weight: 'bold' } } 
            }
        }
    };

    return (
        <div className={`config-page ${darkMode ? 'dark' : 'light'}`} 
             style={{ 
                 minHeight: '100vh', 
                 paddingBottom: '120px', 
                 transition: '0.3s',
                 backgroundColor: darkMode ? '#0b0e14' : '#f3f4f6' 
             }}>
            
            {/* CABECERA */}
            <div style={{ textAlign: 'center', padding: '50px 20px 30px' }}>
                <h1 style={{ fontSize: '30px', fontWeight: '800', color: darkMode ? '#f8fafc' : '#1e293b', marginBottom: '10px' }}>
                    🛡️ Centro de Mando Vial
                </h1>
                <p style={{ color: '#64748b', fontSize: '15px' }}>Auditoría y Gestión de Infraestructura Crítica</p>
                
                {/* SELECTOR DE VISTA */}
                <div style={{ 
                    display: 'inline-flex', 
                    background: darkMode ? '#1e293b' : '#e2e8f0', 
                    padding: '5px', borderRadius: '15px', marginTop: '25px', 
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' 
                }}>
                    <button 
                        onClick={() => setView('stats')} 
                        style={{ 
                            padding: '10px 25px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                            background: view === 'stats' ? '#3b82f6' : 'transparent', 
                            color: view === 'stats' ? 'white' : (darkMode ? '#94a3b8' : '#475569'), 
                            transition: '0.3s'
                        }}>📊 Estadísticas</button>
                    <button 
                        onClick={() => setView('heatmap')} 
                        style={{ 
                            padding: '10px 25px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                            background: view === 'heatmap' ? '#ef4444' : 'transparent', 
                            color: view === 'heatmap' ? 'white' : (darkMode ? '#94a3b8' : '#475569'), 
                            transition: '0.3s'
                        }}>🗺️ Zonas Críticas</button>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                
                {view === 'stats' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                        
                        {/* GRÁFICO DE BARRAS */}
                        <div className="settings-section" style={{ height: '380px', borderRadius: '25px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                                Distribución de Estados
                            </h3>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Bar data={dataBar} options={barOptions} />
                            </div>
                        </div>

                        {/* TARJETA DE RESUMEN CORREGIDA */}
                        <div className="settings-section" style={{ borderRadius: '25px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                            <h3 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '30px', textAlign: 'center' }}>
                                Resumen Operativo
                            </h3>
                            <div style={{ 
                                background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)', 
                                borderRadius: '20px', padding: '30px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', 
                                border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.1)',
                                boxShadow: darkMode ? 'none' : '0 10px 20px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#ef4444', fontSize: '45px', fontWeight: '800' }}>{statsData.pendientes}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}>PENDIENTES</div>
                                </div>
                                <div style={{ width: '1px', height: '50px', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#4ade80', fontSize: '45px', fontWeight: '800' }}>{statsData.reparados}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}>REPARADOS</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* MAPA DE CALOR */
                    <div className="settings-section" style={{ height: '550px', borderRadius: '25px', padding: '15px', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', paddingLeft: '10px' }}>
                            Densidad Geográfica (Mapa de Calor)
                        </h3>
                        <div style={{ height: 'calc(100% - 40px)', borderRadius: '20px', overflow: 'hidden' }}>
                            <MapContainer center={[-0.1807, -78.4678]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <HeatmapLayer
                                    points={baches.map(b => [b.lat, b.lng, 500])}
                                    longitudeExtractor={m => m[1]} latitudeExtractor={m => m[0]} intensityExtractor={m => m[2]}
                                    radius={25} blur={15} max={1000}
                                />
                                {baches.map(b => (
                                    <CircleMarker key={b._id} center={[b.lat, b.lng]} radius={6} pathOptions={{ color: b.estado === 'reparado' ? '#4ade80' : '#ef4444', fillOpacity: 0.8, weight: 2 }}>
                                        <Popup>Bache {b._id.slice(-5)}: {b.distancia}cm</Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                )}

                {/* HISTORIAL */}
                <div className="settings-section" style={{ marginTop: '30px', borderRadius: '25px', padding: '30px' }}>
                    <h3 style={{ color: darkMode ? '#f8fafc' : '#1e293b', fontSize: '18px', marginBottom: '25px' }}>📋 Historial de Auditoría</h3>
                    <div className="baches-list" style={{ display: 'grid', gap: '15px' }}>
                        {baches.slice(0, 5).map(bache => (
                            <div key={bache._id} style={{ 
                                background: darkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff', 
                                padding: '20px', borderRadius: '18px', display: 'flex', 
                                justifyContent: 'space-between', alignItems: 'center', 
                                borderLeft: `5px solid ${bache.estado === 'reparado' ? '#4ade80' : '#ef4444'}`,
                                boxShadow: darkMode ? 'none' : '0 4px 6px rgba(0,0,0,0.05)'
                            }}>
                                <div>
                                    <div style={{ color: darkMode ? '#f1f5f9' : '#1e293b', fontWeight: 'bold', fontSize: '15px' }}>{bache.estado === 'reparado' ? 'VÍA REPARADA' : 'REPORTE ACTIVO'}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px' }}>REF: {bache._id.slice(-8)} | Profundidad: {bache.distancia}cm</div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {bache.estado !== 'reparado' && <button onClick={() => marcarReparado(bache._id)} style={{ background: '#22c55e', border: 'none', color: 'white', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>🛠️</button>}
                                    <button onClick={() => borrarBache(bache._id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <p style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '50px' }}>Oráculo Vial v1.0 • Universidad Politécnica Salesiana</p>
        </div>
    );
}

export default AdminPage;