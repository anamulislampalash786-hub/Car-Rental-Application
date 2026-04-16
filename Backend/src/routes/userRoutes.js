import express from 'express';
import { protect, atLeast, restrictTo } from '../middleware/authMiddleware.js';
import {
    getMe, updateMe, unregister,
    getAllUsers, lockUser, updateUserRole,
} from '../controllers/userController.js';

const router = express.Router();
router.use(protect);

// ─── Self ──────────────────────────────────────────────────────────────────────
router.get('/me', getMe);
router.patch('/updateMe', updateMe);
router.delete('/unregister', unregister);

// ─── Moderation (manager+) ────────────────────────────────────────────────────
router.get('/', atLeast('manager'), getAllUsers);
router.patch('/:id/lock', atLeast('manager'), lockUser);

// ─── Role management (boss+) ──────────────────────────────────────────────────
router.patch('/:id/role', atLeast('boss'), updateUserRole);

export default router;