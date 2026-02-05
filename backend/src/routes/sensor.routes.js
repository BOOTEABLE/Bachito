const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');

// Ruta para enviar datos (POST)
router.post('/', sensorController.receiveData);

// Ruta para ver datos (GET) 
// Verifica que el nombre después del punto sea IGUAL al del controlador
router.get('/', sensorController.getAllData); 
router.patch('/:id', sensorController.updateLocation);
module.exports = router;