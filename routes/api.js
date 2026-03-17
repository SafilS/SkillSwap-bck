const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authController = require('../controllers/authController');
const User = require('../models/User');

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// Match route
router.get('/matches/:userId', matchController.getMatches);

// Quick User routes for testing
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
