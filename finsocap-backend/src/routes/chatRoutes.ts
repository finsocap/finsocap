import { Router } from 'express';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
} from '../controllers/chatController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.get('/conversations', authenticateToken, getConversations);
router.get('/conversations/:conversationId/messages', authenticateToken, getMessages);
router.post('/conversations', authenticateToken, createConversation);
router.post('/messages', authenticateToken, sendMessage);

export default router;
