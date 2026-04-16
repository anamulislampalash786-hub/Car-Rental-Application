import express from 'express';
import { protect, atLeast } from '../middleware/authMiddleware.js';
import {
    requestRental, processRental, activateRental,
    returnCar, getMyRentals, getAllRentals, getRental,
} from '../controllers/rentalController.js';

const router = express.Router();

router.use(protect); // all rental routes require login

// ─── User ─────────────────────────────────────────────────────────────────────
router.post('/',         requestRental);   // request a rental
router.get('/my',        getMyRentals);    // my rentals + stats

// ─── Manager+ ─────────────────────────────────────────────────────────────────
router.get('/', atLeast('manager'), getAllRentals);
router.get('/:id', atLeast('manager'), getRental);
router.patch('/:id/process', atLeast('manager'), processRental);   // approve or reject
router.patch('/:id/activate', atLeast('manager'), activateRental);  // car picked up
router.patch('/:id/return', atLeast('manager'), returnCar);       // car returned

export default router;