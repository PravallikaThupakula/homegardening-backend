const mongoose = require('mongoose');
const { Schema } = mongoose;

const userChallengeSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true, ref: 'User' },
    challenge_id: { type: Schema.Types.ObjectId, required: true, ref: 'Challenge' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.UserChallenge || mongoose.model('UserChallenge', userChallengeSchema);
