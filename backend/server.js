// UBICACIÓN: backend/server.js
const app = require('./src/app'); // ✅ Esto ya estaba bien
const PORT = process.env.PORT || 4000;

// 👇 AQUÍ ESTABAN LOS ERRORES: Agregamos "/src/" a las rutas
const authRoutes = require('./src/routes/auth'); 

// OJO CON EL NOMBRE DEL ARCHIVO: En tu imagen se ve como "sensor.routes.js"
// Si te da error, verifica si el archivo se llama "sensor.routes.js" o "sensores.js"
const sensorRoutes = require('./src/routes/sensor.routes'); 

// --- USAR RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/sensores', sensorRoutes);

// --- ARRANCAR SERVIDOR ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});