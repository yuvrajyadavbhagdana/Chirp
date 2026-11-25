const Post = require('../models/Post');

const getTrending = async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const trending = await Post.aggregate([
    { $match: { createdAt: { $gte: since }, hashtags: { $exists: true, $ne: [] } } },
    { $unwind: '$hashtags' },
    { $match: { hashtags: { $type: 'string', $regex: /^[a-z0-9_]+$/ } } },
    { $group: { _id: { $toLower: '$hashtags' }, count: { $sum: 1 } } },
    { $match: { _id: { $ne: '' } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 5 },
  ]);
  res.json(trending.map((item, index) => ({ tag: item._id, count: item.count, rank: index + 1 })));
};

const getPostsByTag = async (req, res) => {
  const tag = req.params.tag.toLowerCase().replace(/^#/, '');
  if (!/^[a-z0-9_]+$/.test(tag)) return res.status(400).json({ message: 'Invalid hashtag' });
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const query = { hashtags: tag };
  const [posts, total] = await Promise.all([
    Post.find(query).populate('author', 'name username avatar').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Post.countDocuments(query),
  ]);
  res.json({
    tag,
    posts: posts.map((post) => ({ ...post.toObject(), isLiked: post.likes.some((id) => id.toString() === req.user._id.toString()) })),
    page, pages: Math.ceil(total / limit), total,
  });
};

module.exports = { getTrending, getPostsByTag };
