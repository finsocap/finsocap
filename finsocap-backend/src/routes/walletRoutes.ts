import { Router } from 'express';
import { getPartnerWallet, createTransaction, getAllWallets } from '../controllers/walletController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Partner wallet routes
router.get('/partner/:partnerId', authenticateToken, getPartnerWallet);
router.post('/transaction', authenticateToken, createTransaction);
router.get('/all', authenticateToken, requireAdmin, getAllWallets);

export default router;
