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
  skillOffered: {
    type: String,
    required: true
  },
  skillRequested: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  scheduledTime: {
    type: Date
  },
  message: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
