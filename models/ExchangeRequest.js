const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill', // The skill being requested
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'scheduled'],
    default: 'pending'
  },
  message: {
    type: String
  },
  scheduledAt: {
    type: Date
  },
  durationMinutes: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
