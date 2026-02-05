const SensorData = require('../models/SensorData');

// Función para RECIBIR (POST)
exports.receiveData = async (req, res) => {
    try {
        const data = new SensorData(req.body);
        await data.save();
        res.status(201).json({ message: 'Guardado' });
    } catch (error) {
        res.status(500).json({ error: 'Error' });
    }
};

// Función para VER (GET) - ASEGÚRATE QUE ESTÉ AQUÍ
exports.getAllData = async (req, res) => {
    try {
        const datos = await SensorData.find().sort({ timestamp: -1 });
        res.status(200).json(datos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos' });
    }
};
// Función para ACTUALIZAR coordenadas (PATCH)
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;
        
        const bacheActualizado = await SensorData.findByIdAndUpdate(
            id, 
            { lat, lng }, 
            { new: true }
        );
        
        res.status(200).json(bacheActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar ubicación' });
    }
};