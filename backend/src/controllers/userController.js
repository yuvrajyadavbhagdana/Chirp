const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');

const getProfile = async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const [followers, following, posts] = await Promise.all([
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    Post.countDocuments({ author: user._id }),
  ]);
  const isFollowing = req.user ? await Follow.exists({ follower: req.user._id, following: user._id }) : false;
  res.json({
    _id: user._id, name: user.name, username: user.username, avatar: user.avatar, coverImage: user.coverImage,
    bio: user.bio, role: user.role, createdAt: user.createdAt,
    followers, following, posts: posts, isFollowing: Boolean(isFollowing), isOwnProfile: req.user?._id.toString() === user._id.toString(),
  });
};

const updateProfile = async (req, res) => {
  const allowed = ['name', 'bio', 'avatar', 'coverImage'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({
    _id: req.user._id, name: req.user.name, username: req.user.username, email: req.user.email,
    avatar: req.user.avatar, coverImage: req.user.coverImage, bio: req.user.bio, role: req.user.role,
  });
};

const getUserPosts = async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const [posts, total] = await Promise.all([
    Post.find({ author: user._id }).populate('author', 'name username avatar').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Post.countDocuments({ author: user._id }),
  ]);
  res.json({
    posts: posts.map((post) => ({ ...post.toObject(), isLiked: post.likes.some((id) => id.toString() === req.user._id.toString()) })),
    page, pages: Math.ceil(total / limit), total,
  });
};

module.exports = { getProfile, updateProfile, getUserPosts };
