const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    post_id: { type: Schema.Types.ObjectId, required: true, ref: 'ForumPost', index: true },
    user_id: { type: String, required: true, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ForumLike || mongoose.model('ForumLike', likeSchema);
