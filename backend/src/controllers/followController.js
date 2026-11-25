const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');

const followUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot follow yourself' });
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  try {
    await Follow.create({ follower: req.user._id, following: target._id });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You already follow this user' });
    throw error;
  }
  await Notification.create({ recipient: target._id, sender: req.user._id, type: 'follow' });
  res.status(201).json({ following: true });
};

const unfollowUser = async (req, res) => {
  await Follow.findOneAndDelete({ follower: req.user._id, following: req.params.id });
  res.json({ following: false });
};

const getFollowers = async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const links = await Follow.find({ following: user._id }).populate('follower', 'name username avatar bio').limit(100);
  res.json({ users: links.map((link) => link.follower) });
};

const getFollowing = async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const links = await Follow.find({ follower: user._id }).populate('following', 'name username avatar bio').limit(100);
  res.json({ users: links.map((link) => link.following) });
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing };
