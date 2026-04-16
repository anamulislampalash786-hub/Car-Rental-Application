import Location from '../models/Location.js';

// ─── CREATE (manager+) ────────────────────────────────────────────────────────

export const createLocation = async (req, res) => {
    try {
        const location = await Location.create({
            name:    req.body.name,
            city:    req.body.city,
            country: req.body.country,
            address: req.body.address,
            phone:   req.body.phone,
            email:   req.body.email,
        });

        res.status(201).json({ status: 'success', data: { location } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ALL (public) ─────────────────────────────────────────────────────────

export const getAllLocations = async (req, res) => {
    try {
        const filter = {};

        // public only sees active locations
        // manager+ can see inactive ones too via ?isActive=false
        const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
        const isStaff = req.user &&
            ROLE_HIERARCHY.indexOf(req.user.role) >= ROLE_HIERARCHY.indexOf('manager');

        if (!isStaff) {
            filter.isActive = true;
        } else if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        const locations = await Location.find(filter).sort('city');
        res.status(200).json({
            status: 'success',
            results: locations.length,
            data: { locations },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ONE (public) ─────────────────────────────────────────────────────────

export const getLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ status: 'fail', message: 'Location not found' });
        }
        res.status(200).json({ status: 'success', data: { location } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

// ─── GET CARS AT LOCATION (public) ────────────────────────────────────────────

export const getCarsAtLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ status: 'fail', message: 'Location not found' });
        }

        const Car = (await import('../models/Car.js')).default;

        const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
        const isStaff = req.user &&
            ROLE_HIERARCHY.indexOf(req.user.role) >= ROLE_HIERARCHY.indexOf('manager');

        // ✅ public sees available only, staff sees all
        const filter = { location: req.params.id };
        if (!isStaff) {
            filter.status = 'available';
        } else if (req.query.status) {
            filter.status = req.query.status;
        }

        const cars = await Car.find(filter).select('-__v');

        res.status(200).json({
            status:  'success',
            results: cars.length,
            data:    { location, cars },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── UPDATE (manager+) ────────────────────────────────────────────────────────

export const updateLocation = async (req, res) => {
    try {
        const allowed = ['name', 'city', 'country', 'address', 'phone', 'email', 'isActive'];
        const updates = {};
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const location = await Location.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!location) {
            return res.status(404).json({ status: 'fail', message: 'Location not found' });
        }

        res.status(200).json({ status: 'success', data: { location } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── DELETE / DEACTIVATE (boss+) ──────────────────────────────────────────────
// soft delete — deactivate instead of removing
// a location with rental history should never be hard deleted

export const deactivateLocation = async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!location) {
            return res.status(404).json({ status: 'fail', message: 'Location not found' });
        }

        res.status(200).json({
            status: 'success',
            message: `${location.name} has been deactivated`,
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};