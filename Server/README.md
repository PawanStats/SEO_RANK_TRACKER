# Server - SEO Rank Tracker Backend

Express.js backend API for the SEO Rank Tracker application with MongoDB, JWT authentication, and automated rank tracking.

## 🎯 Features

- RESTful API with Express.js
- JWT-based authentication
- MongoDB for data persistence
- Automated daily rank checking with cron jobs
- Real-time polling support
- Comprehensive error handling
- Request validation
- CORS enabled for frontend communication

## 🛠️ Tech Stack

- **Node.js 22** - Runtime
- **Express.js 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **node-cron** - Task scheduling
- **Playwright** - Browser automation
- **Browserbase** - Cloud browser sessions
- **dotenv** - Environment variables

## 📁 Directory Structure

```
Server/
├── server.js                       # Main server file
├── config/
│   └── db.js                       # MongoDB connection
├── models/
│   ├── User.js                     # User schema
│   ├── Analysis.js                 # Analysis schema
│   └── keywordTracking.js          # Keyword tracking schema
├── controllers/
│   ├── authController.js           # Auth logic
│   ├── rankController.js           # Rank tracking logic
│   └── analysisController.js       # Analysis logic
├── services/
│   ├── rankTrackerService.js       # Rank tracking logic
│   ├── keywordTrackingService.js   # Keyword service
│   ├── geminiService.js            # Gemini AI integration
│   ├── cheerioScraperService.js    # Scraper service
│   └── scarperService.js           # Additional scraper
├── routes/
│   ├── authRoutes.js               # Auth endpoints
│   ├── rankRoutes.js               # Rank endpoints
│   └── analysisRoutes.js           # Analysis endpoints
├── middleware/
│   └── auth.js                     # JWT middleware
├── cron/
│   └── rankTrackingCron.js         # Daily tracking job
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── package-lock.json               # Dependency lock file
```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Environment Setup
Create `.env` file:
```bash
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/?appName=SEO"
JWT_SECRET="your_jwt_secret_key_here"
BROWSERBASE_API_KEY="bb_live_xxxxx"
GEMINI_API_KEY="AIzaxxxxx"
PORT=5000
NODE_ENV=development
```

### Start Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

Server runs on `http://localhost:5000`

## 📦 Dependencies

### Main Dependencies
- `express@5.x` - Web framework
- `mongoose@9.x` - MongoDB ODM
- `jsonwebtoken@9.x` - JWT tokens
- `bcrypt@6.x` - Password hashing
- `dotenv@17.x` - Environment variables
- `cors@2.8.x` - Cross-origin requests
- `node-cron@4.x` - Task scheduling
- `playwright-core@1.x` - Browser automation
- `@browserbasehq/sdk@2.x` - Cloud browser
- `@google/genai@2.x` - Gemini AI
- `axios@1.x` - HTTP requests
- `cheerio@1.x` - HTML parsing

## 🔐 Authentication

### JWT Strategy
1. User registers with email and password
2. Password hashed with bcrypt (salt rounds: 10)
3. JWT token generated on login
4. Token sent to client, stored in localStorage
5. Token included in `Authorization: Bearer {token}` header
6. Middleware validates token on protected routes

### Auth Middleware
```javascript
// middleware/auth.js
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token" });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};
```

## 📊 Database Models

### User Schema
```javascript
{
  email: String (unique, required),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### KeywordTracking Schema
```javascript
{
  userId: ObjectId (required, ref: User),
  keyword: String (required, lowercase),
  URL: String (required),
  domain: String (required),
  currentPosition: Number,
  currentPage: Number,
  bestPosition: Number,
  positionChange: Number,
  rankHistory: [rankEntrySchema],
  competitors: [competitorSchema],
  active: Boolean (default: true),
  lastChecked: Date,
  status: String (enum: pending, checking, completed, failed),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 API Endpoints

### Authentication

#### POST `/api/auth/register`
Register new user
```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```

### Rank Tracking

#### POST `/api/rank/add`
Add keyword for tracking
```json
{
  "keyword": "seo tools",
  "url": "example.com"
}
```

#### GET `/api/rank/list`
Get all keywords for user

#### GET `/api/rank/:id`
Get specific keyword details

#### POST `/api/rank/:id/refresh`
Trigger manual rank check

#### PUT `/api/rank/:id/toggle`
Toggle tracking on/off

#### DELETE `/api/rank/:id`
Delete keyword

## 🤖 Rank Tracking Service

### Mock Mode (Current)
```javascript
// Returns random positions (1-50)
// Simulates competitor data
// Used while Browserbase API is under upgrade
```

### Production Mode (Upcoming)
```javascript
// Real-time Google search
// Parses SERP results
// Extracts exact positions
// Identifies competitors
```

### How Rank Tracking Works

1. **Input**: Keyword and target domain
2. **Search**: Queries Google with Browserbase
3. **Parse**: Extracts results from SERP
4. **Match**: Compares domain against results
5. **Extract**: Captures title, URL, snippet
6. **Store**: Saves to MongoDB with timestamp
7. **Output**: Returns position and competitors

## ⏰ Cron Jobs

### Daily Rank Tracking
```javascript
// Runs: 6:00 AM UTC daily
// Finds: All active keyword tracking records
// Updates: Position, page, competitors
// Stores: Historical data
// Notifies: On completion
```

```bash
cron.schedule('0 6 * * *', async () => {
  // Daily rank tracking logic
});
```

## 🔍 Error Handling

### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || "Internal server error" 
  });
});
```

### Validation
- Email format validation
- URL format validation
- Required field checks
- Token validation
- Rate limiting (optional)

## 📝 Logging

Console logs include:
- Server startup status
- MongoDB connection status
- Cron job execution
- Rank tracking progress
- Error details with stack traces

Example output:
```
Server is running on port 5000
MongoDB connected successfully
Rank tracking cron job scheduled

🔎 Starting rank tracking for keyword: "seo tools"
✅ Rank tracking completed: Position 5, Page 1
💾 Tracking saved successfully
```

## 🚀 Deployment

### Deploy to Railway
```bash
# Connect repository
# Set environment variables
# Auto-deploy on push
```

### Deploy to Heroku
```bash
heroku login
heroku create app-name
git push heroku main
```

### Docker Deployment
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### Test Endpoints with cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Add keyword
curl -X POST http://localhost:5000/api/rank/add \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"seo tools","url":"example.com"}'
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check `MONGODB_URI` format
- Verify IP whitelist in MongoDB Atlas
- Test connection string with MongoDB Compass

### JWT Errors
- Verify `JWT_SECRET` is set
- Check token format in headers
- Ensure token hasn't expired

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti :5000 | xargs kill -9

# Or use different port
PORT=5001 npm start
```

### Browserbase Issues
- Check API key validity
- Monitor API usage limits
- Check network connectivity
- Review browser session logs

## 📚 Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Guide](https://mongoosejs.com)
- [JWT.io](https://jwt.io)
- [Node.js Best Practices](https://nodejs.org/en/docs)

## 🔄 Performance Optimization

- Database indexing on frequently queried fields
- Connection pooling with Mongoose
- Caching for frequently accessed data
- Request validation before processing
- Error handling prevents crashes

## 📈 Monitoring

Monitor server health:
- Server status: `GET /`
- MongoDB connection
- Cron job execution
- Error logs
- API response times

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create PR

---

*Last Updated: May 26, 2026*
