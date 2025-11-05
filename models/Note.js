const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 255,
    trim: true
  },
  content: { 
    type: String, 
    default: '',
    // Không giới hạn độ dài để có thể lưu nhiều text
  },
  // Tags để phân loại notes
  tags: [{
    type: String,
    trim: true
  }],
  // Category/Folder để tổ chức notes
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  // Để ghim note quan trọng
  isPinned: {
    type: Boolean,
    default: false
  },
  // Để đánh dấu note đã lưu trữ
  isArchived: {
    type: Boolean,
    default: false
  },
  // Color để phân biệt notes
  color: {
    type: String,
    default: '#ffffff',
    match: /^#[0-9A-Fa-f]{6}$/
  },
  // Metadata
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware để cập nhật updatedAt
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index để tìm kiếm nhanh
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ userId: 1, tags: 1 });

// Method để extract links từ content
noteSchema.methods.extractLinks = function() {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = this.content.match(urlRegex) || [];
  return links;
};

// Static method để tìm kiếm notes
noteSchema.statics.searchNotes = function(userId, query) {
  return this.find({
    userId,
    isArchived: false,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  });
};

module.exports = mongoose.model('Note', noteSchema);
