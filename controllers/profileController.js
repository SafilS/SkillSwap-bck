const User = require('../models/User');
const Skill = require('../models/Skill');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const skills = await Skill.find({ userId: req.user.id });
    
    res.json({ user, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, location, displayName } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, location, displayName },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSkill = async (req, res) => {
  try {
    const { name, category, type } = req.body;
    
    // Check if skill exists
    let skill = await Skill.findOne({ userId: req.user.id, name, type });
    if (skill) {
      return res.status(400).json({ error: 'Skill already exists' });
    }
    
    skill = new Skill({
      userId: req.user.id,
      name,
      category: category || 'General',
      level: 50,
      type // 'offering' or 'learning'
    });
    
    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
