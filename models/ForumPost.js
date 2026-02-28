const mongoose = require('mongoose');
const { Schema } = mongoose;

const forumPostSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'general' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ForumPost || mongoose.model('ForumPost', forumPostSchema);
