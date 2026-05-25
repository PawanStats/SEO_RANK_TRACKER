import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import rankRouter from './routes/rankRoutes.js';

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('server is running');
});
app.use("/api/auth",authRouter)
app.use("/api/rank", rankRouter);
app.use("/api/analysis", analysisRouter);

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