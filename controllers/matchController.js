const User = require('../models/User');
const Skill = require('../models/Skill');

// A basic matching algorithm
// Find users who are offering skills that the current user wants to learn,
// AND who want to learn skills that the current user is offering.
exports.getMatches = async (req, res) => {
  try {
    const currentUserId = req.params.userId;
    
    // 1. Get current user's skills
    const currentUserSkills = await Skill.find({ userId: currentUserId });
    
    const offering = currentUserSkills.filter(s => s.type === 'offering').map(s => s.name.toLowerCase());
    const learning = currentUserSkills.filter(s => s.type === 'learning').map(s => s.name.toLowerCase());

    if (offering.length === 0 && learning.length === 0) {
      return res.json([]);
    }

    // 2. Find mutual matches
    // We look for other users' skills that match ours
    const potentialMatches = await Skill.find({
      userId: { $ne: currentUserId },
      $or: [
        { type: 'offering', name: { $in: learning.map(l => new RegExp(`^${l}$`, 'i')) } },
        { type: 'learning', name: { $in: offering.map(o => new RegExp(`^${o}$`, 'i')) } }
      ]
    }).populate('userId', 'displayName avatarUrl trustScore');

    // 3. Score and group by user
    const userScores = {};
    
    potentialMatches.forEach(skill => {
      const uId = skill.userId._id.toString();
      if (!userScores[uId]) {
        userScores[uId] = {
          user: skill.userId,
          score: 0,
          reasons: [],
          matchedLearning: false,
          matchedOffering: false
        };
      }
      
      if (skill.type === 'offering') {
        userScores[uId].score += 40;
        userScores[uId].reasons.push(`They can teach you ${skill.name}`);
        userScores[uId].matchedOffering = true;
      } else if (skill.type === 'learning') {
        userScores[uId].score += 40;
        userScores[uId].reasons.push(`You can teach them ${skill.name}`);
        userScores[uId].matchedLearning = true;
      }
    });

    // Bonus for mutual exchange
    Object.values(userScores).forEach(match => {
      if (match.matchedLearning && match.matchedOffering) {
        match.score += 20; // Bonus
        match.reasons.unshift("Perfect Mutual Exchange");
      }
      // Cap at 100
      match.score = Math.min(match.score, 100);
    });

    // 4. Format the response
    const results = Object.values(userScores)
      .sort((a, b) => b.score - a.score)
      .map(match => ({
        other_profile: {
          user_id: match.user._id,
          display_name: match.user.displayName,
          avatar_url: match.user.avatarUrl,
          trust_score: match.user.trustScore
        },
        match_score: match.score,
        match_reasons: match.reasons,
        ai_analysis: match.matchedLearning && match.matchedOffering 
          ? "Highly compatible for mutual skill exchange."
          : "Partial match for skill transfer."
      }));

    res.json(results);
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
};
