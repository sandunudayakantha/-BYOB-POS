const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Menu name is required (e.g. VIP Menu, Normal Menu, Breakfast Menu)'],
      trim: true,
      maxlength: [150, 'Menu name cannot exceed 150 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Menu description cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    isBaseMenu: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
