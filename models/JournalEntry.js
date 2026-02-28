const mongoose = require('mongoose');
const { Schema } = mongoose;

const journalSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    plant_id: { type: String, default: null },
    title: String,
    notes: String,
    mood: String,
    weather: String,
    image_url: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.JournalEntry || mongoose.model('JournalEntry', journalSchema);
