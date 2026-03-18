const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillRequested, message, scheduledTime } = req.body;
    
    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
    
    // Don't request yourself
    if (receiverId === req.user.id) return res.status(400).json({ error: 'Cannot request yourself' });

    // Check if pending request already exists
    const existing = await ExchangeRequest.findOne({
      senderId: req.user.id,
      receiverId,
      status: 'pending'
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Pending request already exists with this user' });
    }

    const request = new ExchangeRequest({
      senderId: req.user.id,
      receiverId,
      skillOffered,
      skillRequested,
      message,
      scheduledTime
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    // Get both sent and received
    const sent = await ExchangeRequest.find({ senderId: req.user.id }).populate('receiverId', 'displayName avatarUrl');
    const received = await ExchangeRequest.find({ receiverId: req.user.id }).populate('senderId', 'displayName avatarUrl');
    
    res.json({ sent, received });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await ExchangeRequest.findOne({ _id: id, receiverId: req.user.id });
    if (!request) return res.status(404).json({ error: 'Request not found or not authorized' });
    
    request.status = status;
    await request.save();
    
    // If accepted, we might update users' sessionsCompleted counter later
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
