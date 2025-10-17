const mongoose = require('mongoose');

const monthlyGoalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  description: { 
    type: String, 
    default: '' 
  },
  // Thời gian thực hiện hàng ngày (ví dụ: "06:00")
  dailyTime: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Format HH:MM
  },
  // Ngày bắt đầu mục tiêu
  startDate: { 
    type: Date, 
    required: true 
  },
  // Ngày kết thúc mục tiêu (cuối tháng)
  endDate: { 
    type: Date, 
    required: true 
  },
  // Timezone của user
  timezone: { 
    type: String, 
    default: 'UTC',
    required: true 
  },
  // Trạng thái mục tiêu
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  // Cấu hình lặp lại
  repeatConfig: {
    // Các ngày trong tuần (0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7)
    weekdays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    // Có lặp vào cuối tuần không
    includeWeekends: {
      type: Boolean,
      default: true
    }
  },
  // Thống kê
  stats: {
    // Số ngày đã hoàn thành trong tháng hiện tại
    completedDays: {
      type: Number,
      default: 0
    },
    // Tổng số ngày trong tháng hiện tại
    totalDays: {
      type: Number,
      default: 0
    },
    // Tỷ lệ hoàn thành (%)
    completionRate: {
      type: Number,
      default: 0
    },
    // Ngày cập nhật thống kê cuối cùng
    lastStatsUpdate: {
      type: Date,
      default: Date.now
    }
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
monthlyGoalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method để tính toán thống kê
monthlyGoalSchema.methods.calculateStats = function() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Đếm số ngày trong tháng hiện tại
  const daysInMonth = endOfMonth.getDate();
  
  // Đếm số ngày đã hoàn thành (sẽ được cập nhật từ tasks)
  // Logic này sẽ được implement trong controller
  
  this.stats.totalDays = daysInMonth;
  this.stats.lastStatsUpdate = now;
  
  return this;
};

// Method để kiểm tra xem có cần tạo tasks cho ngày hôm nay không
monthlyGoalSchema.methods.shouldCreateTasksForToday = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Kiểm tra xem mục tiêu có active không
  if (this.status !== 'active') return false;
  
  // Kiểm tra xem có trong khoảng thời gian của mục tiêu không
  if (today < this.startDate || today > this.endDate) return false;
  
  // Kiểm tra ngày trong tuần
  const dayOfWeek = today.getDay();
  if (!this.repeatConfig.includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return false;
  }
  
  // Kiểm tra weekdays cụ thể
  if (this.repeatConfig.weekdays.length > 0 && !this.repeatConfig.weekdays.includes(dayOfWeek)) {
    return false;
  }
  
  return true;
};

// Static method để lấy tất cả mục tiêu cần tạo tasks hôm nay
monthlyGoalSchema.statics.getGoalsForToday = function() {
  return this.find({
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
};

module.exports = mongoose.model('MonthlyGoal', monthlyGoalSchema);
