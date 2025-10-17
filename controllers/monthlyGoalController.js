const { validationResult } = require('express-validator');
const MonthlyGoal = require('../models/MonthlyGoal');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// Tạo mục tiêu hàng tháng
exports.createMonthlyGoal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user._id;
    const { title, description, dailyTime, timezone, repeatConfig } = req.body;

    // Tính toán startDate và endDate cho tháng hiện tại
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyGoal = new MonthlyGoal({
      userId,
      title,
      description,
      dailyTime,
      startDate: startOfMonth,
      endDate: endOfMonth,
      timezone: timezone || 'UTC',
      repeatConfig: {
        weekdays: repeatConfig?.weekdays || [1, 2, 3, 4, 5], // Mặc định thứ 2-6
        includeWeekends: repeatConfig?.includeWeekends || false
      }
    });

    await monthlyGoal.save();

    // Tạo tasks cho phần còn lại của tháng
    await generateTasksForGoal(monthlyGoal);

    res.status(201).json({
      message: 'Monthly goal created successfully',
      goal: monthlyGoal
    });
  } catch (err) {
    console.error('createMonthlyGoal error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy danh sách mục tiêu hàng tháng của user
exports.getMonthlyGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, month, year } = req.query;

    let filter = { userId };
    
    if (status) {
      filter.status = status;
    }

    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      filter.startDate = { $lte: endOfMonth };
      filter.endDate = { $gte: startOfMonth };
    }

    const goals = await MonthlyGoal.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({ goals });
  } catch (err) {
    console.error('getMonthlyGoals error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy chi tiết một mục tiêu
exports.getMonthlyGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const goalId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID' });
    }

    const goal = await MonthlyGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ message: 'Monthly goal not found' });
    }

    // Lấy tasks liên quan đến mục tiêu này
    const tasks = await Task.find({
      userId,
      monthlyGoalId: goalId
    }).sort({ dueDate: 1 });

    res.json({
      goal,
      tasks,
      progress: {
        completed: goal.stats.completedDays,
        total: goal.stats.totalDays,
        rate: goal.stats.completionRate
      }
    });
  } catch (err) {
    console.error('getMonthlyGoal error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cập nhật mục tiêu
exports.updateMonthlyGoal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user._id;
    const goalId = req.params.id;
    const { title, description, dailyTime, timezone, repeatConfig, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID' });
    }

    const goal = await MonthlyGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ message: 'Monthly goal not found' });
    }

    // Cập nhật các trường
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (dailyTime !== undefined) goal.dailyTime = dailyTime;
    if (timezone !== undefined) goal.timezone = timezone;
    if (repeatConfig !== undefined) goal.repeatConfig = repeatConfig;
    if (status !== undefined) goal.status = status;

    await goal.save();

    res.json({
      message: 'Monthly goal updated successfully',
      goal
    });
  } catch (err) {
    console.error('updateMonthlyGoal error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Xóa mục tiêu
exports.deleteMonthlyGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const goalId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ message: 'Invalid goal ID' });
    }

    const goal = await MonthlyGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ message: 'Monthly goal not found' });
    }

    // Xóa tất cả tasks liên quan
    await Task.deleteMany({ userId, monthlyGoalId: goalId });

    // Xóa mục tiêu
    await MonthlyGoal.findByIdAndDelete(goalId);

    res.json({ message: 'Monthly goal deleted successfully' });
  } catch (err) {
    console.error('deleteMonthlyGoal error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy báo cáo tiến độ
exports.getProgressReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0);

    // Lấy tất cả mục tiêu trong tháng
    const goals = await MonthlyGoal.find({
      userId,
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth }
    });

    // Lấy tasks đã hoàn thành trong tháng
    const completedTasks = await Task.find({
      userId,
      monthlyGoalId: { $exists: true },
      status: 'Done',
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Tính toán thống kê
    const report = {
      month: targetMonth,
      year: targetYear,
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      totalTasks: completedTasks.length,
      goals: goals.map(goal => ({
        id: goal._id,
        title: goal.title,
        completedDays: goal.stats.completedDays,
        totalDays: goal.stats.totalDays,
        completionRate: goal.stats.completionRate,
        status: goal.status
      }))
    };

    res.json(report);
  } catch (err) {
    console.error('getProgressReport error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Hàm helper để tạo tasks cho mục tiêu
async function generateTasksForGoal(goal) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Kiểm tra xem có cần tạo tasks hôm nay không
    if (!goal.shouldCreateTasksForToday()) {
      return;
    }

    // Tạo task cho hôm nay
    const taskDate = new Date(today);
    const [hours, minutes] = goal.dailyTime.split(':');
    taskDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Kiểm tra xem task đã tồn tại chưa (idempotent)
    const existingTask = await Task.findOne({
      userId: goal.userId,
      monthlyGoalId: goal._id,
      dueDate: {
        $gte: new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()),
        $lt: new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate() + 1)
      }
    });

    if (existingTask) {
      return; // Task đã tồn tại, không tạo duplicate
    }

    const task = new Task({
      userId: goal.userId,
      title: goal.title,
      description: goal.description,
      status: 'To do',
      priority: 'medium',
      project: 'Monthly Goals',
      tags: ['monthly-goal', 'recurring'],
      dueDate: taskDate,
      monthlyGoalId: goal._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await task.save();

    // Cập nhật thống kê của mục tiêu
    await updateGoalStats(goal._id);

  } catch (err) {
    console.error('generateTasksForGoal error', err);
  }
}

// Hàm helper để cập nhật thống kê mục tiêu
async function updateGoalStats(goalId) {
  try {
    const goal = await MonthlyGoal.findById(goalId);
    if (!goal) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Đếm số tasks đã hoàn thành trong tháng
    const completedTasks = await Task.countDocuments({
      userId: goal.userId,
      monthlyGoalId: goalId,
      status: 'Done',
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Đếm tổng số tasks trong tháng
    const totalTasks = await Task.countDocuments({
      userId: goal.userId,
      monthlyGoalId: goalId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Cập nhật thống kê
    goal.stats.completedDays = completedTasks;
    goal.stats.totalDays = totalTasks;
    goal.stats.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    goal.stats.lastStatsUpdate = now;

    await goal.save();
  } catch (err) {
    console.error('updateGoalStats error', err);
  }
}

// Export helper functions
exports.generateTasksForGoal = generateTasksForGoal;
exports.updateGoalStats = updateGoalStats;
