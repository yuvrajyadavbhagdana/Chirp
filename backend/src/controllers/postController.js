const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const isHttpUrl = require('../utils/isHttpUrl');
const isVideoSource = require('../utils/isVideoSource');

const addPostData = async (posts, userId) => posts.map((post) => ({
  ...post.toObject(),
  isLiked: post.likes.some((id) => id.toString() === userId.toString()),
}));

const createPost = async (req, res) => {
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl.trim() : '';
  const videoUrl = typeof req.body.videoUrl === 'string' ? req.body.videoUrl.trim() : '';
  if (!content && !imageUrl && !videoUrl) {
    return res.status(400).json({ message: 'Post content or media is required' });
  }
  if (content.length > 280) return res.status(400).json({ message: 'Posts cannot exceed 280 characters' });
  if (imageUrl && videoUrl) {
    return res.status(400).json({ message: 'A post can contain either an image or a video, not both' });
  }
  if (imageUrl && !isHttpUrl(imageUrl)) {
    return res.status(400).json({ message: 'Image URL must be a valid HTTP or HTTPS URL' });
  }
  if (videoUrl && !isVideoSource(videoUrl)) {
    return res.status(400).json({ message: 'Video URL must be HTTP/HTTPS or a supported app video path' });
  }
  const post = await Post.create({ author: req.user._id, content, imageUrl, videoUrl });
  await post.populate('author', 'name username avatar');
  res.status(201).json({ ...post.toObject(), isLiked: false });
};

const getFeed = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const follows = await Follow.find({ follower: req.user._id }).select('following');
  const authors = [req.user._id, ...follows.map((follow) => follow.following)];
  const query = { author: { $in: authors } };
  const [posts, total] = await Promise.all([
    Post.find(query).populate('author', 'name username avatar').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Post.countDocuments(query),
  ]);
  res.json({ posts: await addPostData(posts, req.user._id), page, pages: Math.ceil(total / limit), total });
};

const getPosts = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const [posts, total] = await Promise.all([
    Post.find().populate('author', 'name username avatar').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Post.countDocuments(),
  ]);
  res.json({ posts: await addPostData(posts, req.user._id), page, pages: Math.ceil(total / limit), total });
};

const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name username avatar');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ ...post.toObject(), isLiked: post.likes.some((id) => id.toString() === req.user._id.toString()) });
};

const getLikes = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('likes', 'name username avatar');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ users: post.likes.filter(Boolean) });
};

const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You cannot delete this post' });
  }
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
};

const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.likes.some((id) => id.toString() === req.user._id.toString())) {
    return res.status(409).json({ message: 'Post is already liked' });
  }
  post.likes.push(req.user._id);
  await post.save();
  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id });
  }
  res.json({ liked: true, likeCount: post.likes.length });
};

const unlikePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
  await post.save();
  res.json({ liked: false, likeCount: post.likes.length });
};

module.exports = { createPost, getFeed, getPosts, getPost, getLikes, deletePost, likePost, unlikePost };
