const Rating = require('../models/Rating');
const InstagramProfile = require('../models/InstagramProfile');

async function recalculateAvgRating(profileId) {
  const ratings = await Rating.find({ profile: profileId });

  if (ratings.length === 0) {
    await InstagramProfile.findByIdAndUpdate(profileId, { avgRating: null });
    return;
  }

  const avg = ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;
  await InstagramProfile.findByIdAndUpdate(profileId, { avgRating: avg.toFixed(2) });
}

module.exports = recalculateAvgRating;
