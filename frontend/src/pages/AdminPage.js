// UBICACIÓN: src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import '../App.css'; 

function AdminPage() {
    const [baches, setBaches] = useState([]);
    const [filtro, setFiltro] = useState('todos'); // 'todos', 'pendientes', 'reparados'
    
    // --- NUEVO: ESTADOS PARA CALIBRACIÓN ---
    const [umbral, setUmbral] = useState(20);
    const [guardando, setGuardando] = useState(false);

    // 1. Cargar datos del servidor
    const cargarBaches = async () => {
        try {
            const ip = localStorage.getItem('serverIp') || 'localhost';
            const res = await axios.get(`http://192.168.3.52:4000/api/sensores`);
            setBaches(res.data.reverse()); 
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { 
        cargarBaches(); 
        // Cargar el umbral guardado anteriormente (si existe)
        const umbralGuardado = localStorage.getItem('umbralBache');
        if (umbralGuardado) setUmbral(parseInt(umbralGuardado));
    }, []);

    // 2. Función para Borrar (CONECTADA AL SERVIDOR)
    const borrarBache = async (id) => {
        if (window.confirm("¿Eliminar reporte permanentemente?")) {
            try {
                // 1. Avisamos al servidor
                await axios.delete(`http://192.168.3.52:4000/api/sensores/${id}`);
                
                // 2. Si el servidor dice OK, actualizamos la pantalla
                setBaches(baches.filter(b => b._id !== id));
            } catch (error) {
                console.error(error);
                alert("Error: No se pudo eliminar de la base de datos.");
            }
        }
    };

    // 3. Función para "Reparar" (CONECTADA AL SERVIDOR)
    const marcarReparado = async (id) => {
        try {
            // 1. Avisamos al servidor (Guardamos en BD)
            await axios.patch(`http://192.168.3.52:4000/api/sensores/${id}`, { estado: 'reparado' });

            // 2. Actualizamos la pantalla visualmente
            const nuevosBaches = baches.map(b => {
                if (b._id === id) {
                    return { ...b, estado: 'reparado' }; 
                }
                return b;
            });
            setBaches(nuevosBaches);
            alert("✅ Registro guardado: Vía reparada.");
        } catch (error) {
            console.error(error);
            alert("Error al guardar el estado en la base de datos.");
        }
    };

    // 4. FUNCIÓN DESCARGAR EXCEL
    const descargarReporte = () => {
        const datosParaExcel = baches.map(b => ({
            ID: b._id,
            Estado: b.estado === 'reparado' ? 'Reparado' : 'Pendiente',
            Profundidad_CM: b.distancia,
            Latitud: b.lat,
            Longitud: b.lng,
            Fecha: new Date(b.fecha).toLocaleString()
        }));

        const headers = Object.keys(datosParaExcel[0]).join(","); 
        const filas = datosParaExcel.map(obj => Object.values(obj).join(",")).join("\n"); 
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + filas;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Vial_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- NUEVO: FUNCIÓN GUARDAR UMBRAL ---
    const guardarUmbral = async () => {
        setGuardando(true);
        try {
            // Guardamos en localStorage para que la App lo recuerde
            localStorage.setItem('umbralBache', umbral);
            
            setTimeout(() => {
                setGuardando(false);
                alert(`✅ Sistema actualizado: Alertas desde ${umbral} cm.`);
            }, 1000);
        } catch (error) {
            alert("Error guardando configuración");
            setGuardando(false);
        }
    };

    // Filtramos la lista
    const bachesFiltrados = baches.filter(b => {
        if (filtro === 'pendientes') return !b.estado || b.estado !== 'reparado';
        if (filtro === 'reparados') return b.estado === 'reparado';
        return true;
    });

    return (
        <div className="config-page dark" style={{minHeight: '100vh', paddingBottom: '80px'}}>
            <div className="admin-header" style={{textAlign: 'center', padding: '20px'}}>
                <h2>🛡️ Centro de Comando</h2>
                <p style={{color: '#9ca3af'}}>Gestión de Mantenimiento Vial</p>
                
                {/* BOTÓN EXPORTAR */}
                <button 
                    onClick={descargarReporte}
                    style={{
                        marginTop: '10px', background: '#3b82f6', color: 'white',
                        border: 'none', padding: '10px 20px', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex',
                        alignItems: 'center', gap: '8px'
                    }}
                >
                    📥 Descargar Reporte Excel
                </button>
            </div>

            {/* 👇 NUEVA SECCIÓN: CONTROL DE SENSIBILIDAD 👇 */}
            <div className="stats-card" style={{flexDirection: 'column', alignItems: 'stretch', gap: '15px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3 style={{margin: 0, fontSize: '16px'}}>🎛️ Calibración de Sensores</h3>
                    <span style={{
                        background: '#3b82f6', color: 'white', 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                        Nivel actual: {umbral} cm
                    </span>
                </div>

                <div style={{padding: '0 10px'}}>
                    <p style={{fontSize: '13px', color: '#9ca3af', marginBottom: '15px'}}>
                        Define la profundidad mínima para lanzar una alerta roja a los conductores.
                    </p>
                    
                    <input 
                        type="range" 
                        min="5" max="50" step="1"
                        value={umbral}
                        onChange={(e) => setUmbral(e.target.value)}
                        style={{width: '100%', cursor: 'pointer', accentColor: '#3b82f6'}}
                    />
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '5px'}}>
                        <span>Alta Sensibilidad (5cm)</span>
                        <span>Baja Sensibilidad (50cm)</span>
                    </div>

                    <button 
                        onClick={guardarUmbral}
                        disabled={guardando}
                        style={{
                            width: '100%', marginTop: '15px', padding: '12px',
                            background: guardando ? '#64748b' : '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '10px',
                            fontWeight: 'bold', cursor: guardando ? 'wait' : 'pointer'
                        }}
                    >
                        {guardando ? '📡 Sincronizando Red...' : 'Guardar Nueva Configuración'}
                    </button>
                </div>
            </div>

            {/* TARJETAS DE ESTADÍSTICAS */}
            <div className="stats-card">
                <div className="stat-item">
                    <span className="stat-number" style={{color: '#ef4444'}}>
                        {baches.filter(b => !b.estado).length}
                    </span>
                    <span className="stat-label">Pendientes</span>
                </div>
                <div className="stat-line"></div>
                <div className="stat-item">
                    <span className="stat-number" style={{color: '#4ade80'}}>
                        {baches.filter(b => b.estado === 'reparado').length}
                    </span>
                    <span className="stat-label">Reparados</span>
                </div>
            </div>

            {/* FILTROS Y LISTA */}
            <div style={{display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px'}}>
                <button onClick={() => setFiltro('todos')} className="btn-omitir" style={{flex: '0 1 auto', padding: '8px 15px'}}>Todos</button>
                <button onClick={() => setFiltro('pendientes')} className="btn-omitir" style={{flex: '0 1 auto', padding: '8px 15px'}}>Pendientes</button>
            </div>

            <h3 style={{marginLeft: '20px', color: '#fff'}}>Listado de Reportes</h3>
            
            <div style={{padding: '0 20px'}}>
                {bachesFiltrados.map(bache => (
                    <div key={bache._id} style={{
                        background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(5px)',
                        padding: '15px', borderRadius: '16px', marginBottom: '12px',
                        borderLeft: bache.estado === 'reparado' ? '5px solid #4ade80' : '5px solid #ef4444',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <p style={{margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px', color: 'white'}}>
                                {bache.estado === 'reparado' ? '✅ Vía Reparada' : '⚠️ Bache Activo'}
                            </p>
                            <p style={{margin: 0, fontSize: '13px', color: '#94a3b8'}}>
                                Profundidad: <span style={{color: '#fff', fontWeight: 'bold'}}>{bache.distancia}cm</span>
                            </p>
                            <p style={{margin: 0, fontSize: '11px', color: '#64748b'}}>
                                {new Date(bache.fecha).toLocaleString()}
                            </p>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            {bache.estado !== 'reparado' && (
                                <button onClick={() => marcarReparado(bache._id)} style={{
                                    background: '#22c55e', border: 'none', color: 'white',
                                    padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                                }}>🛠️ Reparar</button>
                            )}
                            <button onClick={() => borrarBache(bache._id)} style={{
                                background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444',
                                padding: '6px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'
                            }}>🗑️ Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPage;