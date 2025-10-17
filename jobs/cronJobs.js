const cron = require('node-cron');
const { generateTasksForAllGoals, updateAllGoalStats, cleanupOldTasks } = require('./monthlyGoalScheduler');

// Khởi tạo cron jobs
const initializeCronJobs = () => {
  console.log('🕐 Initializing cron jobs...');

  // Job 1: Tạo tasks cho monthly goals mỗi ngày lúc 00:01
  cron.schedule('1 0 * * *', async () => {
    console.log('🔄 Running daily task generation...');
    await generateTasksForAllGoals();
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Job 2: Cập nhật thống kê mỗi ngày lúc 23:59
  cron.schedule('59 23 * * *', async () => {
    console.log('📊 Running daily stats update...');
    await updateAllGoalStats();
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Job 3: Dọn dẹp tasks cũ mỗi tuần (Chủ nhật lúc 02:00)
  cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Running weekly cleanup...');
    await cleanupOldTasks();
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Job 4: Cập nhật thống kê mỗi giờ (để đảm bảo dữ liệu real-time)
  cron.schedule('0 * * * *', async () => {
    console.log('📈 Running hourly stats update...');
    await updateAllGoalStats();
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('✅ Cron jobs initialized successfully');
  console.log('📅 Schedule:');
  console.log('  - Daily task generation: 00:01 UTC');
  console.log('  - Daily stats update: 23:59 UTC');
  console.log('  - Weekly cleanup: Sunday 02:00 UTC');
  console.log('  - Hourly stats update: Every hour');
};

// Hàm để dừng tất cả cron jobs
const stopCronJobs = () => {
  console.log('🛑 Stopping all cron jobs...');
  cron.getTasks().forEach(task => {
    task.destroy();
  });
  console.log('✅ All cron jobs stopped');
};

// Hàm để chạy manual jobs (cho testing)
const runManualJobs = {
  generateTasks: async () => {
    console.log('🔄 Running manual task generation...');
    await generateTasksForAllGoals();
  },
  
  updateStats: async () => {
    console.log('📊 Running manual stats update...');
    await updateAllGoalStats();
  },
  
  cleanup: async () => {
    console.log('🧹 Running manual cleanup...');
    await cleanupOldTasks();
  }
};

module.exports = {
  initializeCronJobs,
  stopCronJobs,
  runManualJobs
};
