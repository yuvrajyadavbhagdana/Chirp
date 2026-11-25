const User = require('../models/User');
const Post = require('../models/Post');

const search = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ users: [], hashtags: [] });
  const clean = q.replace(/^#/, '').slice(0, 40);
  const [users, hashtagPosts] = await Promise.all([
    User.find({
      $or: [
        { username: { $regex: clean, $options: 'i' } },
        { name: { $regex: clean, $options: 'i' } },
      ],
    }).select('name username avatar bio').limit(8),
    Post.find({ hashtags: { $regex: `^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } })
      .distinct('hashtags'),
  ]);
  const hashtags = hashtagPosts
    .filter((tag) => tag.toLowerCase().includes(clean.toLowerCase()))
    .slice(0, 8);
  res.json({ users, hashtags });
};

module.exports = { search };
