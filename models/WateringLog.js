const mongoose = require('mongoose');
const { Schema } = mongoose;

const wateringLogSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    plant_id: { type: Schema.Types.ObjectId, ref: 'GardenItem', required: true },
    watered_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.WateringLog || mongoose.model('WateringLog', wateringLogSchema);
