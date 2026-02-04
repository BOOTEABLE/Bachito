const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  deviceId: String,
  movimiento: Boolean,
  distancia: Number,
  bache: Boolean,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
