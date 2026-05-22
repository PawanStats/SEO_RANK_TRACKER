import express from "express";
import auth from "../middleware/auth.js"; // Standard JWT Auth Verification Layer
import { 
    addKeyword, 
    getKeyword, 
    getKeywords, 
    refreshKeyword, 
    toggleTracking, 
    deleteKeyword 
} from "../controllers/rankController.js";

const rankRouter = express.Router();
rankRouter.post('/add', auth, addKeyword);
rankRouter.get('/list', auth, getKeywords);
rankRouter.get('/:id', auth, getKeyword);
rankRouter.post('/:id/refresh', auth, refreshKeyword);
rankRouter.put('/:id/toggle', auth, toggleTracking);
rankRouter.delete('/:id', auth, deleteKeyword);

export default rankRouter;