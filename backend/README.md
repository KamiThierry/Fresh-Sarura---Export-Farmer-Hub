# Backend API Documentation

## Overview

This is a **production-ready** Node.js backend using Express.js, MongoDB, and MVC architecture. Built with senior-level best practices for scalability, maintainability, and performance.

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection configuration
│   └── environment.js       # Environment variables and config
├── controllers/
│   ├── healthController.js  # Health check logic
│   └── [your controllers]   # Business logic here
├── models/
│   ├── Example.js           # Sample Mongoose model
│   └── [your models]        # Database schemas here
├── routes/
│   ├── index.js             # Main routes aggregator
│   ├── health.js            # Health check routes
│   └── [your routes]        # API endpoints here
├── middleware/
│   ├── errorHandler.js      # Global error handling
│   ├── logger.js            # Morgan logging configuration
│   └── requests.js          # Request/response middleware
├── utils/
│   ├── logger.js            # Winston logger setup
│   ├── helpers.js           # Utility functions
│   └── [your utilities]     # Helper functions here
├── logs/
│   ├── error.log            # Error logs
│   └── combined.log         # All logs
├── server.js                # Entry point
├── package.json
├── .env.example
└── .gitignore
```

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 4.0 (local or cloud instance)

### Setup

1. **Clone and navigate:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/garden_api
LOG_LEVEL=info
API_VERSION=v1
```

4. **Start the server:**

**Development (with hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Health Check Endpoints

#### 1. Basic Health Status
```
GET /api/v1/health
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-04-06T10:30:00.000Z",
  "uptime": 125.456,
  "environment": "development",
  "database": {
    "status": "connected",
    "connected": true
  },
  "memory": {
    "heapUsed": 45,
    "heapTotal": 125
  }
}
```

#### 2. Detailed Health Information
```
GET /api/v1/health/detailed
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2024-04-06T10:30:00.000Z",
  "uptime": 125.456,
  "environment": "development",
  "server": {
    "version": "v1",
    "nodeVersion": "v18.0.0"
  },
  "database": {
    "status": "connected",
    "connected": true,
    "provider": "MongoDB"
  },
  "system": {
    "memory": {...},
    "cpuUsage": {...}
  }
}
```

## Key Features

### 🔒 Security
- **Helmet.js**: Secures HTTP headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Using express-validator
- **Error Sanitization**: Sensitive data removed from responses

### 📊 Logging
- **Winston Logger**: Structured logging with multiple transports
- **Morgan Middleware**: HTTP request logging
- **File Rotation**: Logs stored in `logs/` directory
- **Log Levels**: error, warn, info, http, debug

### 🛠️ Development
- **Nodemon**: Auto-reload on file changes
- **ES6 Modules**: Modern JavaScript imports
- **Environment Configuration**: .env support
- **Compression**: Gzip response compression

### 🗄️ Database
- **Mongoose ODM**: MongoDB object modeling
- **Middleware Hooks**: Pre/post database operations
- **Validation**: Schema-level validation
- **Indexing**: Performance optimization

## Error Handling

The application implements comprehensive error handling:

### Built-in Error Types Handled
- **CastError**: Invalid MongoDB ID format
- **ValidationError**: Schema validation failures
- **DuplicateKey**: Duplicate unique field values
- **JWT Errors**: Token validation issues
- **Custom Errors**: App-defined errors

### Custom Error Class
```javascript
import { AppError } from './middleware/errorHandler.js';

throw new AppError('Resource not found', 404);
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment (development/production) |
| PORT | 3000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/garden_api | MongoDB connection string |
| LOG_LEVEL | info | Logging level (error/warn/info/http/debug) |
| API_VERSION | v1 | API version prefix |
| CORS_ORIGIN | * | CORS allowed origins |

## Adding New Routes & Controllers

### Example: Create a User Endpoint

**1. Create Model** (`models/User.js`):
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

**2. Create Controller** (`controllers/userController.js`):
```javascript
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ success: true, data: users });
});
```

**3. Create Routes** (`routes/users.js`):
```javascript
import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();
router.get('/', userController.getAllUsers);
export default router;
```

**4. Register Routes** (Update `routes/index.js`):
```javascript
import userRoutes from './users.js';
router.use(`${apiVersion}/users`, userRoutes);
```

## Testing

Run tests with coverage:
```bash
npm test
```

Example test file structure:
```javascript
import request from 'supertest';
import app from '../server.js';

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
```

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set `LOG_LEVEL=warn`
- [ ] Enable CORS restrictions (set `CORS_ORIGIN`)
- [ ] Review security headers (Helmet config)
- [ ] Set up monitoring/alerting
- [ ] Configure log rotation
- [ ] Test error scenarios
- [ ] Load testing
- [ ] Security audit

## Performance Optimization

- **Compression**: Enabled by default
- **Connection Pooling**: Mongoose handles MongoDB connections
- **Indexing**: Create indexes on frequently queried fields
- **Pagination**: Implement for large datasets
- **Caching**: Consider Redis for frequently accessed data

## Monitoring

Monitor these metrics in production:
- Error rates and types
- Response times
- Memory usage
- Database connection status
- API uptime

## Troubleshooting

### MongoDB Connection Issues
```
Check MongoDB is running:
- Local: mongod daemon
- Cloud: Network access & credentials
```

### Port Already in Use
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Clear Logs
```bash
rm -rf logs/*
```

## Contributing Guidelines

1. Follow the MVC structure
2. Add error handling using `asyncHandler`
3. Include JSDoc comments for functions
4. Test new endpoints
5. Update documentation

## License

ISC

## Support

For issues or questions, refer to:
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
