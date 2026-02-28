const mongoose = require('mongoose');
const { Schema } = mongoose;

const pestSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    symptoms: String,
    description: String,
    affected_plants: { type: [String], default: [] },
    treatment: String,
    prevention: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.PestDisease || mongoose.model('PestDisease', pestSchema);
