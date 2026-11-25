const mongoose = require('mongoose');
const extractHashtags = require('../utils/extractHashtags');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 280 },
  hashtags: [{ type: String, lowercase: true, trim: true }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyCount: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.pre('validate', function extractTags() {
  this.hashtags = extractHashtags(this.content);
});

postSchema.index({ createdAt: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
