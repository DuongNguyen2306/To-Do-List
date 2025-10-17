// ToDoList API Integration Example
// Base URL: https://to-do-list-vsb8.onrender.com

const API_BASE_URL = 'https://to-do-list-vsb8.onrender.com';

// ===========================================
// 🔐 AUTHENTICATION FUNCTIONS
// ===========================================

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Refresh access token
export const refreshToken = async (refreshToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (refreshToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// ===========================================
// 📝 TASK FUNCTIONS
// ===========================================

// Get all tasks
export const getTasks = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.project) queryParams.append('project', filters.project);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const url = `${API_BASE_URL}/api/tasks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get tasks error:', error);
    throw error;
  }
};

// Create new task
export const createTask = async (token, taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
};

// Update task
export const updateTask = async (token, taskId, taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update task error:', error);
    throw error;
  }
};

// Delete task (soft delete/archive)
export const deleteTask = async (token, taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete task error:', error);
    throw error;
  }
};

// Hard delete task (permanent delete)
export const hardDeleteTask = async (token, taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/hard`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Hard delete task error:', error);
    throw error;
  }
};

// Restore archived task
export const restoreTask = async (token, taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/restore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Restore task error:', error);
    throw error;
  }
};

// Batch sync tasks
export const syncTasks = async (token, operations) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operations })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sync tasks error:', error);
    throw error;
  }
};

// ===========================================
// 👤 PROFILE FUNCTIONS
// ===========================================

// Get user profile
export const getProfile = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (token, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (token, passwordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// Delete user account
export const deleteAccount = async (token, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/delete-account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

// ===========================================
// 🎯 MONTHLY GOALS FUNCTIONS
// ===========================================

// Create monthly goal
export const createMonthlyGoal = async (token, goalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create monthly goal error:', error);
    throw error;
  }
};

// Get all monthly goals
export const getMonthlyGoals = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.month) queryParams.append('month', filters.month);
    if (filters.year) queryParams.append('year', filters.year);
    
    const url = `${API_BASE_URL}/api/monthly-goals${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get monthly goals error:', error);
    throw error;
  }
};

// Get monthly goal details
export const getMonthlyGoal = async (token, goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals/${goalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get monthly goal error:', error);
    throw error;
  }
};

// Update monthly goal
export const updateMonthlyGoal = async (token, goalId, goalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update monthly goal error:', error);
    throw error;
  }
};

// Delete monthly goal
export const deleteMonthlyGoal = async (token, goalId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals/${goalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete monthly goal error:', error);
    throw error;
  }
};

// Get progress report
export const getProgressReport = async (token, month, year) => {
  try {
    const queryParams = new URLSearchParams();
    if (month) queryParams.append('month', month);
    if (year) queryParams.append('year', year);
    
    const url = `${API_BASE_URL}/api/monthly-goals/progress/report${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get progress report error:', error);
    throw error;
  }
};

// ===========================================
// 🔧 UTILITY FUNCTIONS
// ===========================================

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Get token from localStorage
export const getStoredToken = () => {
  return localStorage.getItem('accessToken');
};

// Store token in localStorage
export const storeToken = (token) => {
  localStorage.setItem('accessToken', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('accessToken');
};

// ===========================================
// 📝 USAGE EXAMPLES
// ===========================================

// Example: Complete authentication flow
export const authFlow = async () => {
  try {
    // 1. Login
    const loginResult = await loginUser({
      email: 'user@example.com',
      password: 'password123'
    });
    
    // 2. Store token
    storeToken(loginResult.accessToken);
    
    // 3. Get tasks
    const tasks = await getTasks(loginResult.accessToken);
    console.log('Tasks:', tasks);
    
    return loginResult;
  } catch (error) {
    console.error('Auth flow error:', error);
    throw error;
  }
};

// Example: Create and manage tasks
export const taskManagement = async (token) => {
  try {
    // Create task
    const newTask = await createTask(token, {
      title: 'Complete project documentation',
      description: 'Write comprehensive API documentation',
      status: 'To do',
      priority: 'high',
      project: 'API Development',
      tags: ['documentation', 'api', 'backend']
    });
    
    console.log('Created task:', newTask);
    
    // Update task
    const updatedTask = await updateTask(token, newTask._id, {
      status: 'In progress',
      priority: 'medium'
    });
    
    console.log('Updated task:', updatedTask);
    
    // Get all tasks
    const allTasks = await getTasks(token);
    console.log('All tasks:', allTasks);
    
    return { newTask, updatedTask, allTasks };
  } catch (error) {
    console.error('Task management error:', error);
    throw error;
  }
};

// Example: Profile management
export const profileManagement = async (token) => {
  try {
    // Get current profile
    const profile = await getProfile(token);
    console.log('Current profile:', profile);
    
    // Update profile
    const updatedProfile = await updateProfile(token, {
      name: 'John Doe Updated',
      avatarUrl: 'https://example.com/new-avatar.jpg'
    });
    console.log('Updated profile:', updatedProfile);
    
    // Change password
    const passwordResult = await changePassword(token, {
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123'
    });
    console.log('Password changed:', passwordResult);
    
    return { profile, updatedProfile, passwordResult };
  } catch (error) {
    console.error('Profile management error:', error);
    throw error;
  }
};

// Example: Monthly Goals management
export const monthlyGoalsManagement = async (token) => {
  try {
    // Create monthly goal
    const newGoal = await createMonthlyGoal(token, {
      title: 'Tập gym mỗi ngày',
      description: 'Tập gym để giữ sức khỏe',
      dailyTime: '06:00',
      timezone: 'Asia/Ho_Chi_Minh',
      repeatConfig: {
        weekdays: [1, 2, 3, 4, 5], // Thứ 2-6
        includeWeekends: false
      }
    });
    console.log('Created monthly goal:', newGoal);
    
    // Get all monthly goals
    const goals = await getMonthlyGoals(token);
    console.log('All monthly goals:', goals);
    
    // Get goal details
    const goalDetails = await getMonthlyGoal(token, newGoal.goal._id);
    console.log('Goal details:', goalDetails);
    
    // Update goal
    const updatedGoal = await updateMonthlyGoal(token, newGoal.goal._id, {
      title: 'Tập gym mỗi ngày - Updated',
      dailyTime: '07:00',
      status: 'active'
    });
    console.log('Updated goal:', updatedGoal);
    
    // Get progress report
    const progressReport = await getProgressReport(token, 10, 2024);
    console.log('Progress report:', progressReport);
    
    return { newGoal, goals, goalDetails, updatedGoal, progressReport };
  } catch (error) {
    console.error('Monthly goals management error:', error);
    throw error;
  }
};

// ===========================================
// 🚨 ERROR HANDLING
// ===========================================

// Handle API errors
export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    removeToken();
    window.location.href = '/login';
  } else if (error.message.includes('404')) {
    // Not found
    console.error('Resource not found');
  } else if (error.message.includes('500')) {
    // Server error
    console.error('Server error');
  } else {
    // Other errors
    console.error('API Error:', error);
  }
};
