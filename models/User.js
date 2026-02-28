const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    _id: { type: String, required: true }, // use UUID or ObjectId
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    location: { type: String, default: null },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    last_streak_date: { type: Date, default: null },
    points: { type: Number, default: 0 },
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
