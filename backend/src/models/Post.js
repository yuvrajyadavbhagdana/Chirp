const mongoose = require('mongoose');
const extractHashtags = require('../utils/extractHashtags');
const isHttpUrl = require('../utils/isHttpUrl');
const isVideoSource = require('../utils/isVideoSource');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, trim: true, maxlength: 280, required() { return !this.imageUrl && !this.videoUrl; } },
  imageUrl: {
    type: String,
    trim: true,
    maxlength: 2048,
    validate: {
      validator: (value) => !value || isHttpUrl(value),
      message: 'Image URL must be a valid HTTP or HTTPS URL',
    },
  },
  videoUrl: {
    type: String,
    trim: true,
    maxlength: 2048,
    validate: {
      validator: (value) => !value || isVideoSource(value),
      message: 'Video URL must be HTTP/HTTPS or a supported app video path',
    },
  },
  hashtags: [{ type: String, lowercase: true, trim: true }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyCount: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.pre('validate', function extractTags() {
  this.hashtags = extractHashtags(this.content || '');
});

postSchema.pre('validate', function validateMedia() {
  if (this.imageUrl && this.videoUrl) {
    this.invalidate('videoUrl', 'A post can contain either an image or a video, not both');
  }
});

postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
