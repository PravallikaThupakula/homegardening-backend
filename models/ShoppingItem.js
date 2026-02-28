const mongoose = require('mongoose');
const { Schema } = mongoose;

const shoppingItemSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true, ref: 'User' },
    item_name: { type: String, required: true },
    category: { type: String, default: 'general' },
    quantity: { type: Number, default: 1 },
    priority: { type: String, default: 'medium' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ShoppingItem || mongoose.model('ShoppingItem', shoppingItemSchema);
