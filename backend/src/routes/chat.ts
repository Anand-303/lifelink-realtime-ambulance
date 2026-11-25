import { Router } from 'express';
import { chatHandler } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

// Chat endpoint - protected by authentication
router.post('/chat', protect, chatHandler);

export default router;
