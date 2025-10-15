# ToDoList API - Deployment Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/todolist?authSource=admin

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here

# Server
PORT=5000
NODE_ENV=production
API_URL=http://localhost:5000

# Cookie Security (set to 'true' in production with HTTPS)
COOKIE_SECURE=false
```

### 2. Docker Deployment

#### Option A: Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: Manual Docker Build

```bash
# Build the image
docker build -t todolist-api .

# Run with MongoDB
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0

# Run the API
docker run -d --name todolist-api -p 5000:5000 --link mongodb:mongodb -e MONGODB_URI=mongodb://admin:password@mongodb:27017/todolist?authSource=admin todolist-api
```

### 3. Manual Deployment

```bash
# Install dependencies
npm install

# Start the application
npm start
```

## 📚 API Documentation

Once deployed, access the Swagger UI at:
- **Local**: http://localhost:5000/api-docs
- **Production**: http://your-domain.com/api-docs

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | - | ✅ |
| `PORT` | Server port | 5000 | ❌ |
| `NODE_ENV` | Environment | development | ❌ |
| `API_URL` | API base URL | http://localhost:5000 | ❌ |
| `COOKIE_SECURE` | Secure cookies | false | ❌ |

### Security Considerations

1. **Change default secrets** in production
2. **Use HTTPS** in production and set `COOKIE_SECURE=true`
3. **Configure CORS** properly for your frontend domain
4. **Use environment variables** for sensitive data
5. **Enable MongoDB authentication** in production

## 🐳 Docker Commands

```bash
# Build image
docker build -t todolist-api .

# Run container
docker run -p 5000:5000 todolist-api

# View logs
docker logs todolist-api

# Execute commands in container
docker exec -it todolist-api sh

# Stop and remove container
docker stop todolist-api && docker rm todolist-api
```

## 🔍 Health Checks

- **Health endpoint**: `GET /health`
- **API status**: `GET /`
- **Swagger docs**: `GET /api-docs`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/restore` - Restore archived task
- `POST /api/tasks/sync` - Sync tasks (batch operations)

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header

3. **CORS Issues**
   - Configure CORS for your frontend domain
   - Check credentials setting

4. **Port Already in Use**
   - Change PORT environment variable
   - Kill process using the port

### Logs

```bash
# Docker logs
docker-compose logs -f app

# Manual deployment logs
npm run dev  # Development
npm start    # Production
```

## 🔄 Updates

To update the application:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## 📊 Monitoring

- Health check endpoint: `/health`
- Application logs: Check container logs
- Database: Monitor MongoDB logs
- Performance: Use monitoring tools

## 🛡️ Security Checklist

- [ ] Change default JWT secrets
- [ ] Use HTTPS in production
- [ ] Set secure cookie options
- [ ] Configure proper CORS
- [ ] Enable MongoDB authentication
- [ ] Use environment variables
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
