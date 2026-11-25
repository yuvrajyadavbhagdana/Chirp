const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true,
    match: /^[a-zA-Z0-9_]{3,20}$/ },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 160 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshToken: { type: String, select: false },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
