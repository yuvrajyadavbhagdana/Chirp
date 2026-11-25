const Reply = require('../models/Reply');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const getReplies = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const [replies, total] = await Promise.all([
    Reply.find({ post: req.params.id }).populate('author', 'name username avatar')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Reply.countDocuments({ post: req.params.id }),
  ]);
  res.json({ replies, page, pages: Math.ceil(total / limit), total });
};

const createReply = async (req, res) => {
  const content = req.body.content?.trim();
  if (!content) return res.status(400).json({ message: 'Reply content is required' });
  if (content.length > 280) return res.status(400).json({ message: 'Replies cannot exceed 280 characters' });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const reply = await Reply.create({ post: post._id, author: req.user._id, content });
  post.replyCount = await Reply.countDocuments({ post: post._id });
  await post.save();
  await reply.populate('author', 'name username avatar');
  if (post.author.toString() !== req.user._id.toString()) {
    await Notification.create({ recipient: post.author, sender: req.user._id, type: 'reply', post: post._id });
  }
  res.status(201).json(reply);
};

module.exports = { getReplies, createReply };
