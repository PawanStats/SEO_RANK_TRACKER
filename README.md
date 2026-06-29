# SEO Rank Tracker 📊
Live :-https://seo-rank-tracker-coral.vercel.app/

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
- 
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

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Browserbase for cloud browser sessions
- Google for SEO insights
- Gemini AI for advanced features
- All contributors and testers


*Last Updated: May 26, 2026*
