const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    binLocation: { 
        type: String, 
        required: true 
    }, // Location of the bin (required)

    fillLevel: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 100 
    }, // Fill level percentage (0-100)

    flameDetected: { 
        type: Boolean, 
        required: true 
    }, // Flame detection status (true/false)

    timestamp: { 
        type: Date, 
        default: Date.now 
    } // Timestamp of when the data was recorded
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
