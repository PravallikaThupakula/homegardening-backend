const mongoose = require('mongoose');
const { Schema } = mongoose;

const seasonalTipSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    season: { type: String, required: true, lowercase: true },
    regions: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.models.SeasonalTip || mongoose.model('SeasonalTip', seasonalTipSchema);
