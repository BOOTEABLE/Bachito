console.log('📦 app.js se está ejecutando');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// CAMBIO AQUÍ: Importamos antes de usar
const sensorRoutes = require('./routes/sensor.routes');

// Este log nos dirá la verdad:
console.log('¿sensorRoutes es una función?:', typeof sensorRoutes === 'function');

app.use('/api/sensores', sensorRoutes);

module.exports = app;