const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  deviceId: String,
  movimiento: Boolean,
  distancia: Number,
  bache: Boolean,
  lat: { type: Number, default: 0 }, // Agregar esto
  lng: { type: Number, default: 0 }, // Agregar esto
  timestamp: { type: Date, default: Date.now },
  estado: { type: String, default: 'pendiente' }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
