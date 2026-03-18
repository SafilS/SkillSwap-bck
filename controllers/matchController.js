const User = require('../models/User');
const Skill = require('../models/Skill');

exports.getMatches = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the user's skills
    const userSkills = await Skill.find({ userId });
    const userLearning = userSkills.filter(s => s.type === 'learning').map(s => s.name.toLowerCase());
    const userOffering = userSkills.filter(s => s.type === 'offering').map(s => s.name.toLowerCase());

    // If user has no skills mapped, don't return anything
    if (userLearning.length === 0 && userOffering.length === 0) {
      return res.json([]);
    }

    // Find other users
    const otherUsers = await User.find({ _id: { $ne: userId } });

    const matches = [];

    for (const other of otherUsers) {
      const otherSkills = await Skill.find({ userId: other._id });
      const otherLearning = otherSkills.filter(s => s.type === 'learning').map(s => s.name.toLowerCase());
      const otherOffering = otherSkills.filter(s => s.type === 'offering').map(s => s.name.toLowerCase());

      // Calculate score based on mutual overlap
      // I am learning what they are offering
      const learningOverlap = userLearning.filter(skill => otherOffering.includes(skill));
      
      // I am offering what they want to learn
      const offeringOverlap = userOffering.filter(skill => otherLearning.includes(skill));

      let score = 0;
      let reasons = [];

      if (learningOverlap.length > 0) {
        score += learningOverlap.length * 40;
        reasons.push(`Can teach you ${learningOverlap.join(', ')}`);
      }

      if (offeringOverlap.length > 0) {
        score += offeringOverlap.length * 40;
        reasons.push(`Wants to learn your ${offeringOverlap.join(', ')}`);
      }

      // Add a base compat score just for having skills
      score += 20;

      // Cap at 99
      score = Math.min(score, 99);

      if (score > 40) {
        matches.push({
          id: `${userId}_${other._id}`,
          user_a_id: userId,
          user_b_id: other._id,
          match_score: score,
          match_reasons: reasons,
          ai_analysis: `High compatibility based on ${learningOverlap.length + offeringOverlap.length} overlapping skills.`,
          other_profile: {
            user_id: other._id,
            display_name: other.displayName,
            avatar_url: other.avatarUrl,
            trust_score: other.trustScore
          }
        });
      }
    }

    // Sort descending by score
    matches.sort((a, b) => b.match_score - a.match_score);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
