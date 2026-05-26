# SEO Rank Tracker 📊

A full-stack web application for tracking keyword rankings on Google Search Engine Results Pages (SERPs). Monitor your SEO performance, track competitor rankings, and analyze ranking trends over time.

![React](https://img.shields.io/badge/React-18.x-blue) ![Node.js](https://img.shields.io/badge/Node.js-22.x-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green) ![Express](https://img.shields.io/badge/Express-5.x-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## 🎯 Features

- **🔍 Keyword Tracking** - Track unlimited keywords and monitor their Google rankings
- **📈 Position Monitoring** - Real-time position updates and historical tracking
- **🏆 Competitor Analysis** - View top 10 competitors ranking for each keyword
- **📊 Analytics Dashboard** - Visual representation of ranking trends and performance metrics
- **🔄 Daily Auto Updates** - Automated cron job for daily rank checks at 6 AM
- **👤 User Authentication** - Secure JWT-based authentication system
- **🎨 Dark/Light Mode** - Beautiful responsive UI with theme switching
- **📱 Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Real-time Polling** - Live status updates as rank checks complete
- **💾 History Tracking** - Complete historical data for trend analysis

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icon library
- **Axios** - HTTP client

### Backend
- **Node.js 22** - JavaScript runtime
- **Express.js 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **node-cron** - Task scheduling
- **Playwright** - Browser automation (upgrade pending)
- **Browserbase** - Cloud browser sessions
- **Gemini API** - AI integration

## 📁 Project Structure

```
SEO_RANK_TRACKER/
├── Client/                          # React Frontend
│   ├── src/
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   ├── index.css               # Global styles
│   │   ├── components/             # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── AnalysesCard.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── home/               # Homepage components
│   │   │       ├── Hero.tsx
│   │   │       ├── Features.tsx
│   │   │       ├── HowItWorks.tsx
│   │   │       ├── Pricing.tsx
│   │   │       └── Footer.tsx
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Login.tsx           # Authentication
│   │   │   ├── Dashboard.tsx       # Main dashboard
│   │   │   ├── RankTracker.tsx     # Rank tracking page
│   │   │   ├── Analyze.tsx         # SEO analysis
│   │   │   ├── History.tsx         # Ranking history
│   │   │   ├── Report.tsx          # Reports page
│   │   │   └── RankDetail.tsx      # Detailed rank view
│   │   ├── context/                # React Context
│   │   │   ├── AppContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── assets/                 # Static assets
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── Server/                          # Express Backend
│   ├── server.js                   # Main server file
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/                     # Database schemas
│   │   ├── User.js
│   │   ├── Analysis.js
│   │   └── keywordTracking.js
│   ├── controllers/                # Route handlers
│   │   ├── authController.js
│   │   ├── rankController.js
│   │   └── analysisController.js
│   ├── services/                   # Business logic
│   │   ├── rankTrackerService.js
│   │   ├── keywordTrackingService.js
│   │   ├── geminiService.js
│   │   ├── cheerioScraperService.js
│   │   └── scarperService.js
│   ├── routes/                     # API routes
│   │   ├── authRoutes.js
│   │   ├── rankRoutes.js
│   │   └── analysisRoutes.js
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── cron/
│   │   └── rankTrackingCron.js     # Daily rank tracking job
│   ├── .env                        # Environment variables
│   └── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 22.x or higher
- MongoDB Atlas account or local MongoDB instance
- Browserbase API key (optional - mock mode available)
- Gemini API key (optional)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/SEO_RANK_TRACKER.git
cd SEO_RANK_TRACKER
```

### 2. Backend Setup
```bash
cd Server

# Install dependencies
npm install

# Create .env file with required variables
cat > .env << EOF
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/?appName=SEO"
JWT_SECRET="your_jwt_secret_key_here"
BROWSERBASE_API_KEY="your_browserbase_api_key"
GEMINI_API_KEY="your_gemini_api_key"
PORT=5000
EOF

# Start the server
npm start
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd Client

# Install dependencies
npm install

# Create .env file (if needed)
cat > .env << EOF
VITE_API_URL="http://localhost:5000"
EOF

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Rank Tracking Endpoints

#### Add Keyword for Tracking
```http
POST /api/rank/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "keyword": "seo tools",
  "url": "example.com"
}

Response:
{
  "success": true,
  "message": "Keyword tracking added successfully",
  "tracking": { ... }
}
```

#### Get All Keywords
```http
GET /api/rank/list
Authorization: Bearer {token}

Response:
{
  "success": true,
  "keywords": [ ... ]
}
```

#### Get Specific Keyword Details
```http
GET /api/rank/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "tracking": {
    "_id": "...",
    "keyword": "seo tools",
    "domain": "example.com",
    "currentPosition": 5,
    "currentPage": 1,
    "bestPosition": 3,
    "positionChange": -2,
    "status": "completed",
    "rankHistory": [ ... ],
    "competitors": [ ... ]
  }
}
```

#### Refresh Keyword Rank
```http
POST /api/rank/:id/refresh
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Rank check started"
}
```

#### Toggle Keyword Tracking (Pause/Resume)
```http
PUT /api/rank/:id/toggle
Authorization: Bearer {token}

Response:
{
  "success": true,
  "tracking": { ... }
}
```

#### Delete Keyword
```http
DELETE /api/rank/:id
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Keyword deleted successfully"
}
```

## 📊 Database Schema

### User Schema
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Keyword Tracking Schema
```javascript
{
  userId: ObjectId (ref: User),
  keyword: String (required, lowercase, trim),
  URL: String (required),
  domain: String (required),
  currentPosition: Number (default: null),
  currentPage: Number (default: null),
  bestPosition: Number (default: null),
  positionChange: Number (default: null),
  rankHistory: [
    {
      date: Date,
      position: Number,
      page: Number,
      title: String,
      snippet: String
    }
  ],
  competitors: [
    {
      position: Number,
      url: String,
      domain: String,
      title: String,
      snippet: String
    }
  ],
  active: Boolean (default: true),
  lastChecked: Date,
  status: String (enum: 'pending', 'checking', 'completed', 'failed'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 How It Works

### Daily Rank Checking
1. **Cron Job** runs daily at **6:00 AM** UTC
2. Finds all active keyword tracking records
3. Updates status to "checking"
4. Calls rank tracking service for each keyword
5. Browser automation searches Google for each keyword
6. Extracts target domain position and competitor data
7. Calculates position changes and trends
8. Stores historical data in database
9. Updates status to "completed" or "failed"

### Real-time Polling
1. User adds a keyword → status: "checking"
2. Frontend polls `/api/rank/:id` every 3 seconds
3. Service calls Browserbase to search Google
4. Position found → Database updated → status: "completed"
5. Frontend displays position live

### Position Calculation
- Scans top 50 Google results (5 pages × 10 results)
- Matches your domain against search results
- Returns exact position number and page
- Identifies competitors in same rankings

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Protected Routes** - All rank endpoints require authentication
- **Environment Variables** - Sensitive data stored securely
- **Input Validation** - Request data validated before processing
- **CORS Configuration** - Cross-origin requests properly configured

## 📈 Tracking Metrics

For each keyword, the app tracks:
- **Current Position** - Today's rank
- **Current Page** - Which Google page (1-5)
- **Best Position** - All-time best ranking
- **Position Change** - Movement compared to last check
- **Status** - pending, checking, completed, failed
- **Rank History** - Daily historical data
- **Competitors** - Top 10 competing domains

## 🚀 Deployment

### Deploy Frontend to Vercel
```bash
cd Client
npm run build
vercel deploy
```

### Deploy Backend to Railway/Heroku
```bash
cd Server
# Set environment variables in deployment platform
git push heroku main
```

## ⚙️ Environment Variables

### Server `.env`
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=SEO
JWT_SECRET=your_super_secret_jwt_key
BROWSERBASE_API_KEY=bb_live_xxxxx
GEMINI_API_KEY=AIzaxxxxx
PORT=5000
```

### Client `.env`
```
VITE_API_URL=http://localhost:5000
```


## 🔮 Upcoming Features

- [ ] Real-time Browserbase integration (API upgrade)
- [ ] Advanced analytics and visualizations
- [ ] Rank change notifications
- [ ] Scheduled email reports
- [ ] Keyword grouping and campaigns
- [ ] API endpoints for third-party integration
- [ ] Multi-language support
- [ ] Advanced filtering and sorting

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Browserbase for cloud browser sessions
- Google for SEO insights
- Gemini AI for advanced features
- All contributors and testers


*Last Updated: May 26, 2026*
