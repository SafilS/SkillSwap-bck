const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number, // 0 to 100
    required: true,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['offering', 'learning'], 
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
