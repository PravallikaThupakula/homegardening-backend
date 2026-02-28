const mongoose = require('mongoose');
const { Schema } = mongoose;

const challengeSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);
