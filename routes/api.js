const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const exchangeController = require('../controllers/exchangeController');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// Profile and Skills routes
router.get('/profile/me', auth, profileController.getProfile);
router.put('/profile/me', auth, profileController.updateProfile);
router.post('/skills', auth, profileController.addSkill);
router.delete('/skills/:id', auth, profileController.removeSkill);

// Exchange Request routes
router.post('/exchanges', auth, exchangeController.createRequest);
router.get('/exchanges', auth, exchangeController.getRequests);
router.put('/exchanges/:id', auth, exchangeController.updateRequestStatus);

// Match route
router.get('/matches/:userId', auth, matchController.getMatches);

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
