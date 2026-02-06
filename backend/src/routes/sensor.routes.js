const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
// 👇 IMPORTANTE: Necesitas importar el modelo aquí también para las rutas manuales
const SensorData = require('../models/SensorData'); 

// 1. RUTA POST (Para el ESP32) -> URL: .../api/sensores
router.post('/', sensorController.receiveData);

// 2. RUTA GET (Para el Mapa y Admin)
router.get('/', sensorController.getAllData);

// 3. RUTA PATCH INTELIGENTE (Sirve para GPS y para Reparar al mismo tiempo)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; 
        
        // Esto permite actualizar { lat, lng } O { estado: 'reparado' } sin conflictos
        const result = await SensorData.findByIdAndUpdate(id, updates, { new: true });
        
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualizando" });
    }
});

// 4. RUTA DELETE (Para eliminar bache)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await SensorData.findByIdAndDelete(id);
        res.json({ message: "Bache eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error eliminando" });
    }
});

module.exports = router;