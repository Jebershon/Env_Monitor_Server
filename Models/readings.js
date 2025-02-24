const mongoose=require("mongoose");
const sensorSchema = new mongoose.Schema({
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
    },
    humidity: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    npk: { 
      nitrogen: { value: { type: Number, required: true }, unit: { type: String, required: true } },
      phosphorus: { value: { type: Number, required: true }, unit: { type: String, required: true } },
      potassium: { value: { type: Number, required: true }, unit: { type: String, required: true } }
    }
  },
  status: { type: String, required: true }
}, { timestamps: true }); // Adds `createdAt` and `updatedAt` automatically

const SensorData = mongoose.model('SensorData', sensorSchema);
module.exports = SensorData;
