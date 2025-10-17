# 🎯 Monthly Goals Feature - Frontend Implementation Prompt

## 📋 Tổng quan tính năng

Tạo chức năng **Monthly Goals** cho phép user:
- Tạo mục tiêu lặp hàng tháng (ví dụ: "Tập gym mỗi ngày lúc 6:00")
- Hệ thống tự động sinh tasks cho các ngày tương ứng
- Theo dõi tiến độ và hiển thị báo cáo
- Hỗ trợ timezone và cấu hình lặp lại linh hoạt

## 🔗 API Endpoints

**Base URL:** `https://to-do-list-vsb8.onrender.com`

### 1. Tạo Monthly Goal
```javascript
POST /api/monthly-goals
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Tập gym mỗi ngày",
  "description": "Tập gym để giữ sức khỏe",
  "dailyTime": "06:00",
  "timezone": "Asia/Ho_Chi_Minh",
  "repeatConfig": {
    "weekdays": [1, 2, 3, 4, 5], // 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7
    "includeWeekends": false
  }
}
```

### 2. Lấy danh sách Monthly Goals
```javascript
GET /api/monthly-goals
Authorization: Bearer YOUR_JWT_TOKEN

// Query parameters:
// - status: active, paused, completed, cancelled
// - month: 1-12
// - year: 2024
```

### 3. Chi tiết Monthly Goal
```javascript
GET /api/monthly-goals/:id
Authorization: Bearer YOUR_JWT_TOKEN

// Response bao gồm:
// - goal: thông tin mục tiêu
// - tasks: danh sách tasks đã tạo
// - progress: thống kê tiến độ
```

### 4. Cập nhật Monthly Goal
```javascript
PUT /api/monthly-goals/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated title",
  "dailyTime": "07:00",
  "status": "active"
}
```

### 5. Xóa Monthly Goal
```javascript
DELETE /api/monthly-goals/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 6. Báo cáo tiến độ
```javascript
GET /api/monthly-goals/progress/report?month=10&year=2024
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🎨 UI/UX Requirements

### 1. Trang danh sách Monthly Goals
- **Layout:** Card-based layout
- **Filters:** Status, tháng/năm
- **Search:** Tìm kiếm theo tên mục tiêu
- **Actions:** Tạo mới, xem chi tiết, chỉnh sửa, xóa

### 2. Form tạo/chỉnh sửa Monthly Goal
```javascript
// Form fields:
{
  title: "Tên mục tiêu" (required, max 255 chars),
  description: "Mô tả" (optional),
  dailyTime: "Thời gian hàng ngày" (HH:MM format),
  timezone: "Múi giờ" (dropdown),
  repeatConfig: {
    weekdays: "Ngày trong tuần" (checkbox group),
    includeWeekends: "Bao gồm cuối tuần" (checkbox)
  }
}
```

### 3. Trang chi tiết Monthly Goal
- **Thông tin mục tiêu:** Title, description, time, timezone
- **Cấu hình lặp:** Weekdays, include weekends
- **Thống kê:** Progress bar, completed/total days, completion rate
- **Danh sách tasks:** Hiển thị tasks đã tạo với status
- **Actions:** Edit, pause/resume, delete

### 4. Dashboard/Progress Report
- **Tổng quan:** Số mục tiêu active, tổng tasks hoàn thành
- **Biểu đồ:** Progress theo tháng
- **Top goals:** Mục tiêu có tỷ lệ hoàn thành cao nhất
- **Calendar view:** Hiển thị tasks theo lịch

## 🛠️ Technical Implementation

### 1. State Management
```javascript
// Redux/Zustand store structure:
{
  monthlyGoals: {
    items: [],
    loading: false,
    error: null,
    filters: {
      status: 'active',
      month: null,
      year: null
    }
  },
  currentGoal: {
    goal: null,
    tasks: [],
    progress: null,
    loading: false
  },
  progressReport: {
    data: null,
    loading: false
  }
}
```

### 2. API Service Functions
```javascript
// monthlyGoalsService.js
export const monthlyGoalsAPI = {
  // Tạo mục tiêu
  createGoal: async (token, goalData) => {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(goalData)
    });
    return response.json();
  },

  // Lấy danh sách mục tiêu
  getGoals: async (token, filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Lấy chi tiết mục tiêu
  getGoalDetails: async (token, goalId) => {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals/${goalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Cập nhật mục tiêu
  updateGoal: async (token, goalId, goalData) => {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(goalData)
    });
    return response.json();
  },

  // Xóa mục tiêu
  deleteGoal: async (token, goalId) => {
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals/${goalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Lấy báo cáo tiến độ
  getProgressReport: async (token, month, year) => {
    const queryParams = new URLSearchParams();
    if (month) queryParams.append('month', month);
    if (year) queryParams.append('year', year);
    
    const response = await fetch(`${API_BASE_URL}/api/monthly-goals/progress/report?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
```

### 3. React Components Structure
```
src/
├── components/
│   ├── MonthlyGoals/
│   │   ├── MonthlyGoalsList.jsx
│   │   ├── MonthlyGoalCard.jsx
│   │   ├── MonthlyGoalForm.jsx
│   │   ├── MonthlyGoalDetails.jsx
│   │   ├── ProgressReport.jsx
│   │   └── GoalFilters.jsx
│   └── common/
│       ├── TimePicker.jsx
│       ├── TimezoneSelector.jsx
│       └── WeekdaySelector.jsx
├── pages/
│   ├── MonthlyGoalsPage.jsx
│   ├── MonthlyGoalDetailsPage.jsx
│   └── ProgressReportPage.jsx
└── services/
    └── monthlyGoalsAPI.js
```

### 4. Key Components Implementation

#### MonthlyGoalForm.jsx
```jsx
import React, { useState } from 'react';
import { TimePicker, TimezoneSelector, WeekdaySelector } from '../common';

const MonthlyGoalForm = ({ onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dailyTime: initialData?.dailyTime || '06:00',
    timezone: initialData?.timezone || 'Asia/Ho_Chi_Minh',
    repeatConfig: {
      weekdays: initialData?.repeatConfig?.weekdays || [1, 2, 3, 4, 5],
      includeWeekends: initialData?.repeatConfig?.includeWeekends || false
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="monthly-goal-form">
      <div className="form-group">
        <label>Tên mục tiêu *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Ví dụ: Tập gym mỗi ngày"
          required
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label>Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Mô tả chi tiết về mục tiêu..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Thời gian hàng ngày *</label>
        <TimePicker
          value={formData.dailyTime}
          onChange={(time) => setFormData({...formData, dailyTime: time})}
        />
      </div>

      <div className="form-group">
        <label>Múi giờ *</label>
        <TimezoneSelector
          value={formData.timezone}
          onChange={(timezone) => setFormData({...formData, timezone})}
        />
      </div>

      <div className="form-group">
        <label>Ngày lặp lại</label>
        <WeekdaySelector
          value={formData.repeatConfig.weekdays}
          onChange={(weekdays) => setFormData({
            ...formData, 
            repeatConfig: {...formData.repeatConfig, weekdays}
          })}
        />
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.repeatConfig.includeWeekends}
            onChange={(e) => setFormData({
              ...formData,
              repeatConfig: {...formData.repeatConfig, includeWeekends: e.target.checked}
            })}
          />
          Bao gồm cuối tuần
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Lưu mục tiêu'}
      </button>
    </form>
  );
};

export default MonthlyGoalForm;
```

#### MonthlyGoalCard.jsx
```jsx
import React from 'react';

const MonthlyGoalCard = ({ goal, onView, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      paused: 'yellow',
      completed: 'blue',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Đang hoạt động',
      paused: 'Tạm dừng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  return (
    <div className="monthly-goal-card">
      <div className="goal-header">
        <h3>{goal.title}</h3>
        <span className={`status-badge ${getStatusColor(goal.status)}`}>
          {getStatusText(goal.status)}
        </span>
      </div>

      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

      <div className="goal-info">
        <div className="info-item">
          <span className="label">Thời gian:</span>
          <span className="value">{goal.dailyTime}</span>
        </div>
        <div className="info-item">
          <span className="label">Múi giờ:</span>
          <span className="value">{goal.timezone}</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{width: `${goal.stats.completionRate}%`}}
          />
        </div>
        <div className="progress-text">
          {goal.stats.completedDays}/{goal.stats.totalDays} ngày ({goal.stats.completionRate}%)
        </div>
      </div>

      <div className="goal-actions">
        <button onClick={() => onView(goal._id)} className="btn-primary">
          Xem chi tiết
        </button>
        <button onClick={() => onEdit(goal._id)} className="btn-secondary">
          Chỉnh sửa
        </button>
        <button onClick={() => onDelete(goal._id)} className="btn-danger">
          Xóa
        </button>
      </div>
    </div>
  );
};

export default MonthlyGoalCard;
```

## 🎨 UI/UX Guidelines

### 1. Color Scheme
- **Active goals:** Green (#10B981)
- **Paused goals:** Yellow (#F59E0B)
- **Completed goals:** Blue (#3B82F6)
- **Cancelled goals:** Red (#EF4444)

### 2. Progress Indicators
- **Progress bar:** Animated fill based on completion rate
- **Completion rate:** Large, prominent percentage
- **Streak counter:** Consecutive days completed

### 3. Responsive Design
- **Mobile:** Single column, stacked cards
- **Tablet:** 2-column grid
- **Desktop:** 3-column grid

### 4. Loading States
- **Skeleton loaders** for cards
- **Spinner** for form submissions
- **Progress indicators** for long operations

## 📱 Mobile Considerations

### 1. Touch Interactions
- **Swipe gestures** for quick actions
- **Long press** for context menus
- **Pull to refresh** for data updates

### 2. Form UX
- **Time picker:** Native mobile time picker
- **Weekday selector:** Touch-friendly checkboxes
- **Keyboard:** Appropriate input types

### 3. Performance
- **Lazy loading** for large lists
- **Virtual scrolling** for many goals
- **Optimistic updates** for better UX

## 🧪 Testing Requirements

### 1. Unit Tests
- Form validation
- API service functions
- Component rendering
- State management

### 2. Integration Tests
- API integration
- User workflows
- Error handling
- Loading states

### 3. E2E Tests
- Complete user journey
- Cross-browser compatibility
- Mobile responsiveness

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design verified
- [ ] Accessibility compliance
- [ ] Performance optimized
- [ ] Tests passing

## 📚 Additional Resources

- **API Documentation:** https://to-do-list-vsb8.onrender.com/api-docs
- **Timezone List:** https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
- **Date/Time Libraries:** moment.js, date-fns, dayjs
- **UI Components:** Material-UI, Ant Design, Chakra UI

---

**Happy coding! 🚀**
