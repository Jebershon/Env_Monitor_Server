const mongoose = require('mongoose');
const sensorSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  sensors: {
    airTemperature: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    soilMoisture: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    soilPh: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    }
  },
  status: { type: String, required: true }
});

const SensorData = mongoose.model('SensorData', sensorSchema);
module.exports = SensorData;
