import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import rankRouter from './routes/rankRoutes.js';
import analysisRouter from './routes/analysisRoutes.js';
import { startRankTrackingCron } from './cron/rankTrackingCron.js';
connectDB();
const app = express();

// CORS Configuration - Allows Local, Production, and Preview Deployments
const allowedOrigins = [
    "http://localhost:5173",
    "https://seo-rank-tracker-coral.vercel.app",
    "https://seo-rank-tracker-git-main-pawanstats-projects.vercel.app"
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            return callback(null, true);
        } else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added OPTIONS for safety
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('server is running');
});
app.use("/api/auth",authRouter)
app.use("/api/rank", rankRouter);
app.use("/api/analysis", analysisRouter);


startRankTrackingCron();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();