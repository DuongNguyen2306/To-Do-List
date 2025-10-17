# 📝 ToDoList API

A comprehensive REST API for managing tasks with authentication, built with Node.js, Express, and MongoDB.

## ✨ Features

- 🔐 **JWT Authentication** with refresh tokens
- 📋 **Task Management** (CRUD operations)
- 🔄 **Batch Sync** for offline support
- 📊 **Swagger Documentation** with interactive UI
- 🐳 **Docker Support** for easy deployment
- 🔍 **Search & Filter** tasks
- 📦 **Pagination** support
- 🏷️ **Tags & Projects** organization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd todolist-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start the application
npm run dev
```

### Docker Deployment

```bash
# Using Docker Compose (Recommended)
docker-compose up -d

# Or manual Docker build
docker build -t todolist-api .
docker run -p 5000:5000 todolist-api
```

## 📚 API Documentation

Once running, access the interactive Swagger UI:

- **Local**: http://localhost:5000/api-docs
- **Production**: http://your-domain.com/api-docs

## 🔧 Environment Configuration

Create a `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/todolist

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here

# Server
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Cookie Security
COOKIE_SECURE=false
```

## 📖 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Logout user | ❌ |

### Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get user profile | ✅ |
| PUT | `/api/profile` | Update user profile | ✅ |
| PUT | `/api/profile/change-password` | Change password | ✅ |
| DELETE | `/api/profile/delete-account` | Delete user account | ✅ |

### Monthly Goals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/monthly-goals` | Create monthly goal | ✅ |
| GET | `/api/monthly-goals` | Get all monthly goals | ✅ |
| GET | `/api/monthly-goals/:id` | Get monthly goal details | ✅ |
| PUT | `/api/monthly-goals/:id` | Update monthly goal | ✅ |
| DELETE | `/api/monthly-goals/:id` | Delete monthly goal | ✅ |
| GET | `/api/monthly-goals/progress/report` | Get progress report | ✅ |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks | ✅ |
| POST | `/api/tasks` | Create new task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task (soft delete/archive) | ✅ |
| DELETE | `/api/tasks/:id/hard` | Permanently delete task | ✅ |
| POST | `/api/tasks/:id/restore` | Restore archived task | ✅ |
| POST | `/api/tasks/sync` | Sync tasks (batch) | ✅ |

### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API status | ❌ |
| GET | `/health` | Health check | ❌ |
| GET | `/api-docs` | Swagger UI | ❌ |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to get an access token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Refresh token** is stored in httpOnly cookie
4. **Use refresh endpoint** to get new access token

### Example Usage

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { accessToken } = await response.json();

// Use token for authenticated requests
const tasks = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## 📋 Task Schema

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "To do",
  "priority": "high",
  "project": "API Development",
  "tags": ["documentation", "api", "backend"],
  "dueDate": "2024-12-31T23:59:59.000Z",
  "reminderAt": "2024-12-30T09:00:00.000Z",
  "isArchived": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Task Status Options
- `To do`
- `In progress`
- `On approval`
- `Done`

### Priority Options
- `low`
- `medium`
- `high`

## 🔍 Query Parameters

### Get Tasks
- `q` - Search in task title
- `status` - Filter by status
- `project` - Filter by project
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 100)

### Delete Task
- `DELETE /api/tasks/:id` - Soft delete (archive task)
- `DELETE /api/tasks/:id/hard` - Hard delete (permanently remove from database)

## 🔄 Batch Sync

The sync endpoint allows batch operations for offline support:

```json
{
  "operations": [
    {
      "op": "create",
      "clientOpId": "op1",
      "clientId": "client_task_1",
      "task": {
        "title": "New task",
        "description": "Task description"
      }
    },
    {
      "op": "update",
      "clientOpId": "op2",
      "task": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Updated task"
      }
    }
  ]
}
```

## 🐳 Docker Commands

```bash
# Development
npm run dev

# Production
npm start

# Docker
npm run docker:build
npm run docker:run

# Docker Compose
npm run docker:up
npm run docker:down
npm run docker:logs
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# View API documentation
open http://localhost:5000/api-docs
```

## 📊 Health Monitoring

- **Health Check**: `GET /health`
- **API Status**: `GET /`
- **Logs**: Check console output or Docker logs

## 🔒 Security Features

- JWT token authentication
- Refresh token rotation
- HttpOnly cookies for refresh tokens
- Password hashing with bcrypt
- Input validation with express-validator
- CORS protection
- MongoDB injection prevention

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "msg": "Validation error",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the deployment guide in `deploy.md`
- Open an issue on GitHub

---

**Happy coding! 🚀**
