import express from 'express';
import multer  from 'multer';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
    getCompany, getBosses, getManagers,
    createCompany, updateCompany,
} from '../controllers/companyController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Public (About page data) ─────────────────────────────────────────────────
router.get('/',          getCompany);
router.get('/bosses',    getBosses);
router.get('/managers',  getManagers);

// ─── Admin only ───────────────────────────────────────────────────────────────
router.post('/',   protect, restrictTo('admin'), upload.single('logo'), createCompany);
router.patch('/',  protect, restrictTo('admin'), upload.single('logo'), updateCompany);

export default router;