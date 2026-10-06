import { Router } from 'express';
import {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/blogController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Public routes for reading blog articles
router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);

// Admin routes for CMS Studio
router.post('/', authenticateToken, requireAdmin, createPost);
router.put('/:id', authenticateToken, requireAdmin, updatePost);
router.delete('/:id', authenticateToken, requireAdmin, deletePost);

export default router;
