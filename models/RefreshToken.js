const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  replacedByToken: { type: String, default: null },
  revokedAt: { type: Date },
});

refreshTokenSchema.methods.isExpired = function() {
  return Date.now() >= this.expiresAt.getTime();
};

refreshTokenSchema.methods.isActive = function() {
  return !this.revokedAt && !this.isExpired();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
