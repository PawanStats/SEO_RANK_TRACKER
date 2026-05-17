import express from 'express';
import { getUser, login, register } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const authrouter = express.Router();

// Register route
authrouter.post('/register', register);
authrouter.post('/login', login);
authrouter.get('/user', auth, getUser);

export default authrouter;