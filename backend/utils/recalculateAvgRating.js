const Rating = require("../models/Rating");
const InstagramProfile = require("../models/InstagramProfile");

module.exports = async function recalculateAvgRating(profileId) {
  const ratings = await Rating.find({ profile: profileId });

  if (ratings.length === 0) {
    return InstagramProfile.findByIdAndUpdate(profileId, { avgRating: null });
  }

  const avg = ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length;
  return InstagramProfile.findByIdAndUpdate(profileId, { avgRating: avg });
};
