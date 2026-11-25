const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');

const dashboard = async (req, res) => {
  const [totalUsers, totalPosts, totalFollows, recentUsers, recentPosts] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Follow.countDocuments(),
    User.find().select('name username email role avatar createdAt').sort({ createdAt: -1 }).limit(5),
    Post.find().populate('author', 'name username avatar').sort({ createdAt: -1 }).limit(5),
  ]);
  res.json({ totalUsers, totalPosts, totalFollows, recentUsers, recentPosts });
};

const getUsers = async (req, res) => {
  const users = await User.find().select('name username email role avatar createdAt').sort({ createdAt: -1 }).limit(100);
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot delete your own account' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await Promise.all([
    Post.deleteMany({ author: user._id }),
    Follow.deleteMany({ $or: [{ follower: user._id }, { following: user._id }] }),
    user.deleteOne(),
  ]);
  res.json({ message: 'User deleted' });
};

const getPosts = async (req, res) => {
  const posts = await Post.find().populate('author', 'name username avatar').sort({ createdAt: -1 }).limit(100);
  res.json(posts);
};

const deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ message: 'Post deleted' });
};

module.exports = { dashboard, getUsers, deleteUser, getPosts, deletePost };
