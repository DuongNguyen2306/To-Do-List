const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 255 },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['To do', 'In progress', 'On approval', 'Done'],
    default: 'To do',
  },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  project: { type: String, default: '' },
  tags: [String],
  dueDate: { type: Date, default: null },
  reminderAt: { type: Date, default: null },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
