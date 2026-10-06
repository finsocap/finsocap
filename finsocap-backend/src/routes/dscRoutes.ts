import { Router } from 'express';
import {
  getAllDscRecords,
  createDscRecord,
  updateDscRecord,
  deleteDscRecord,
} from '../controllers/dscController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateToken, getAllDscRecords);
router.post('/', authenticateToken, requireAdmin, createDscRecord);
router.put('/:id', authenticateToken, requireAdmin, updateDscRecord);
router.delete('/:id', authenticateToken, requireAdmin, deleteDscRecord);

export default router;
