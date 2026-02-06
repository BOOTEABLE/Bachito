import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import '../App.css';

function AdminPage() {
    const [baches, setBaches] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [umbral, setUmbral] = useState(20);
    const [guardando, setGuardando] = useState(false);

    // 🔹 Cargar baches
    const cargarBaches = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/sensores`);
            setBaches(res.data.reverse());
        } catch (err) {
            console.error('Error cargando baches:', err);
        }
    };

    useEffect(() => {
        cargarBaches();
        const umbralGuardado = localStorage.getItem('umbralBache');
        if (umbralGuardado) setUmbral(parseInt(umbralGuardado));
    }, []);

    // 🔹 Eliminar bache
    const borrarBache = async (id) => {
        if (!window.confirm('¿Eliminar reporte permanentemente?')) return;

        try {
            await axios.delete(`${API_URL}/api/sensores/${id}`);
            setBaches(baches.filter(b => b._id !== id));
        } catch (error) {
            console.error(error);
            alert('Error al eliminar el registro');
        }
    };

    // 🔹 Marcar reparado
    const marcarReparado = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/sensores/${id}`, { estado: 'reparado' });
            setBaches(
                baches.map(b => b._id === id ? { ...b, estado: 'reparado' } : b)
            );
        } catch (error) {
            console.error(error);
            alert('Error al actualizar estado');
        }
    };

    // 🔹 Guardar umbral
    const guardarUmbral = () => {
        setGuardando(true);
        localStorage.setItem('umbralBache', umbral);

        setTimeout(() => {
            setGuardando(false);
            alert(`✅ Umbral configurado en ${umbral} cm`);
        }, 800);
    };

    const bachesFiltrados = baches.filter(b => {
        if (filtro === 'pendientes') return b.estado !== 'reparado';
        if (filtro === 'reparados') return b.estado === 'reparado';
        return true;
    });

    return (
        <div className="config-page dark" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <div className="admin-header">
                <h2>🛡️ Centro de Comando</h2>
                <p>Gestión de Mantenimiento Vial</p>
            </div>

            {/* CALIBRACIÓN */}
            <div className="stats-card">
                <h3>🎛️ Calibración de Sensores</h3>
                <p>Umbral actual: <b>{umbral} cm</b></p>

                <input
                    type="range"
                    min="5"
                    max="50"
                    value={umbral}
                    onChange={e => setUmbral(e.target.value)}
                />

                <button onClick={guardarUmbral} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar configuración'}
                </button>
            </div>

            {/* FILTROS */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setFiltro('todos')}>Todos</button>
                <button onClick={() => setFiltro('pendientes')}>Pendientes</button>
                <button onClick={() => setFiltro('reparados')}>Reparados</button>
            </div>

            {/* LISTADO */}
            <div style={{ padding: '20px' }}>
                {bachesFiltrados.map(b => (
                    <div key={b._id} className="stats-card">
                        <p><b>{b.estado === 'reparado' ? '✅ Reparado' : '⚠️ Pendiente'}</b></p>
                        <p>Profundidad: {b.distancia} cm</p>

                        {b.estado !== 'reparado' && (
                            <button onClick={() => marcarReparado(b._id)}>Reparar</button>
                        )}
                        <button onClick={() => borrarBache(b._id)}>Eliminar</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPage;
