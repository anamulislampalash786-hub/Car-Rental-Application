import express from 'express';
import { protect, atLeast, optionalProtect } from '../middleware/authMiddleware.js';
import {
    createLocation, getAllLocations, getLocation,
    getCarsAtLocation, updateLocation, deactivateLocation,
} from '../controllers/locationController.js';

const router = express.Router();

// ─── Public (optionalProtect so staff get extra visibility) ───────────────────
router.get('/',         optionalProtect, getAllLocations);
router.get('/:id',      optionalProtect, getLocation);
router.get('/:id/cars', optionalProtect, getCarsAtLocation);

// ─── Manager+ ─────────────────────────────────────────────────────────────────
router.post('/',        protect, atLeast('manager'), createLocation);
router.patch('/:id',    protect, atLeast('manager'), updateLocation);

// ─── Boss+ ────────────────────────────────────────────────────────────────────
router.delete('/:id',   protect, atLeast('boss'), deactivateLocation);

export default router;