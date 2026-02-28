const mongoose = require('mongoose');
const { Schema } = mongoose;

const plantSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    type: String,
    description: String,
    suitable_regions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PlantCatalog || mongoose.model('PlantCatalog', plantSchema);
