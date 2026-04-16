import express from 'express';
import multer  from 'multer';
import { protect, atLeast, optionalProtect } from '../middleware/authMiddleware.js';
import {
    createCar, getAllCars, getCar,
    updateCar, deleteCar, addReview,
} from '../controllers/carController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', optionalProtect, getAllCars);
router.get('/:id', optionalProtect, getCar);

// ─── User — review (must have rented the car) ─────────────────────────────────
router.post('/:id/reviews', protect, addReview);

// ─── Manager+ ─────────────────────────────────────────────────────────────────
router.post('/', protect, atLeast('manager'), upload.array('images', 10), createCar);
router.patch('/:id', protect, atLeast('manager'), upload.array('images', 10), updateCar);
router.delete('/:id',protect, atLeast('manager'), deleteCar);

export default router;