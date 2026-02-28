const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post_id: { type: Schema.Types.ObjectId, required: true, ref: 'ForumPost', index: true },
    user_id: { type: String, required: true, ref: 'User' },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ForumComment || mongoose.model('ForumComment', commentSchema);
