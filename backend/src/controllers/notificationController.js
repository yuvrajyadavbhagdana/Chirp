const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name username avatar').populate('post', 'content')
    .sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
};

const markRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true }, { new: true },
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
};

module.exports = { getNotifications, markRead };
