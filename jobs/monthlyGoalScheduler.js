const MonthlyGoal = require('../models/MonthlyGoal');
const Task = require('../models/Task');
const { generateTasksForGoal, updateGoalStats } = require('../controllers/monthlyGoalController');

// Job để tạo tasks cho monthly goals
const generateTasksForAllGoals = async () => {
  try {
    console.log('🔄 Starting monthly goal task generation...');
    
    // Lấy tất cả mục tiêu cần tạo tasks hôm nay
    const goals = await MonthlyGoal.getGoalsForToday();
    
    console.log(`📋 Found ${goals.length} goals to process`);
    
    for (const goal of goals) {
      try {
        // Kiểm tra xem có cần tạo tasks hôm nay không
        if (goal.shouldCreateTasksForToday()) {
          console.log(`🎯 Processing goal: ${goal.title}`);
          
          // Tạo tasks cho mục tiêu này
          await generateTasksForGoal(goal);
          
          // Cập nhật thống kê
          await updateGoalStats(goal._id);
          
          console.log(`✅ Generated tasks for goal: ${goal.title}`);
        }
      } catch (error) {
        console.error(`❌ Error processing goal ${goal._id}:`, error);
      }
    }
    
    console.log('✅ Monthly goal task generation completed');
  } catch (error) {
    console.error('❌ Error in monthly goal task generation:', error);
  }
};

// Job để cập nhật thống kê cho tất cả mục tiêu
const updateAllGoalStats = async () => {
  try {
    console.log('📊 Starting goal stats update...');
    
    const goals = await MonthlyGoal.find({ status: 'active' });
    
    for (const goal of goals) {
      try {
        await updateGoalStats(goal._id);
      } catch (error) {
        console.error(`❌ Error updating stats for goal ${goal._id}:`, error);
      }
    }
    
    console.log('✅ Goal stats update completed');
  } catch (error) {
    console.error('❌ Error in goal stats update:', error);
  }
};

// Job để dọn dẹp tasks cũ (tùy chọn)
const cleanupOldTasks = async () => {
  try {
    console.log('🧹 Starting task cleanup...');
    
    // Xóa tasks cũ hơn 3 tháng và đã hoàn thành
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const result = await Task.deleteMany({
      monthlyGoalId: { $exists: true },
      status: 'Done',
      updatedAt: { $lt: threeMonthsAgo }
    });
    
    console.log(`🗑️ Cleaned up ${result.deletedCount} old tasks`);
  } catch (error) {
    console.error('❌ Error in task cleanup:', error);
  }
};

// Export các job functions
module.exports = {
  generateTasksForAllGoals,
  updateAllGoalStats,
  cleanupOldTasks
};
