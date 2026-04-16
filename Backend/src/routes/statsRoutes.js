import express from 'express';
import { protect, atLeast } from '../middleware/authMiddleware.js';
import {
    getManagerStats,
    getBossStats,
    getAdminStats,
} from '../controllers/statsController.js';

const router = express.Router();

router.use(protect);

router.get('/manager', atLeast('manager'), getManagerStats);
router.get('/boss',    atLeast('boss'),    getBossStats);
router.get('/admin',   atLeast('admin'),   getAdminStats);

export default router;