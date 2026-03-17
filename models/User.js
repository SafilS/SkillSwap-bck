const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  trustScore: {
    type: Number,
    default: 0
  },
  sessionsCompleted: {
    type: Number,
    default: 0
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  availability: [{
    type: String
  }],
  // We'll store skill references in a separate collection or embedded docs
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
