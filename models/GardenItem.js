const mongoose = require('mongoose');
const { Schema } = mongoose;

const gardenItemSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    growth_notes: String,
    watering_frequency: { type: Number, default: 2 },
    image_url: String,
    plant_type: String,
    sunlight_requirement: String,
    soil_type: String,
    planting_date: { type: Date, default: Date.now },
    notes: String,
    health_status: String,
    last_watered: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.models.GardenItem || mongoose.model('GardenItem', gardenItemSchema);
