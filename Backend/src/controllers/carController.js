import Car from '../models/Car.js';
import { uploadFile, deleteFile } from '../config/imagekit.js';

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
const uploadCarImages = (files) => Promise.all(files.map(uploadFile));

// ─── CREATE (manager+) ────────────────────────────────────────────────────────

export const createCar = async (req, res) => {
    try {
        const carData = {
            location:     req.body.location,
            addedBy:      req.user._id,
            manufacturer: req.body.manufacturer,
            model:        req.body.model,
            color:        req.body.color,
            year:         Number(req.body.year),
            transmission: req.body.transmission,
            seats:        Number(req.body.seats),
            pricePerDay:  Number(req.body.pricePerDay),
            kilometers:   Number(req.body.kilometers),
            ...(req.body.status && { status: req.body.status }),
        };

        if (req.files?.length > 0) {
            carData.images = await uploadCarImages(req.files);
        }

        const car = await Car.create(carData);
        res.status(201).json({ status: 'success', data: { car } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────

// export const getAllCars = async (req, res) => {
//     try {
//         const filter = {};
//         const requesterLevel = ROLE_HIERARCHY.indexOf(req.user?.role ?? 'user');
//         const isStaff        = requesterLevel >= ROLE_HIERARCHY.indexOf('manager');
//
//         // public only sees available cars
//         // manager+ can filter by any status
//         if (!isStaff) {
//             filter.status = 'available';
//         } else if (req.query.status) {
//             filter.status = req.query.status;
//         }
//
//         // filter by location
//         if (req.query.location) filter.location = req.query.location;
//
//         let query = Car.find(filter)
//             .populate('location', 'name city')
//             .populate('addedBy',  'name');
//
//         if (req.query.sort) {
//             query = query.sort(req.query.sort.split(',').join(' '));
//         } else {
//             query = query.sort('-createdAt');
//         }
//
//         query = query.select('-__v');
//
//         const page  = parseInt(req.query.page,  10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 20;
//         query = query.skip((page - 1) * limit).limit(limit);
//
//         const cars = await query;
//         res.status(200).json({
//             status: 'success',
//             results: cars.length,
//             data: { cars },
//         });
//     } catch (error) {
//         res.status(404).json({ status: 'fail', message: error.message });
//     }
// };

export const getAllCars = async (req, res) => {
    try {
        const filter = {};
        const requesterLevel = ROLE_HIERARCHY.indexOf(req.user?.role ?? 'user');
        const isStaff        = requesterLevel >= ROLE_HIERARCHY.indexOf('manager');

        if (!isStaff) {
            filter.status = 'available';
        } else if (req.query.status) {
            filter.status = req.query.status;
        }

        // location filter
        if (req.query.location) filter.location = req.query.location;

        // transmission filter
        if (req.query.transmission) filter.transmission = req.query.transmission;

        // seats filter — minimum seats using $gte
        if (req.query.seats) filter.seats = { $gte: Number(req.query.seats) };

        let query = Car.find(filter)
            .populate('location', 'name city')
            .populate('addedBy',  'name');

        if (req.query.sort) {
            query = query.sort(req.query.sort.split(',').join(' '));
        } else {
            query = query.sort('-createdAt');
        }

        query = query.select('-__v');

        const page  = parseInt(req.query.page,  10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        query = query.skip((page - 1) * limit).limit(limit);

        const cars = await query;
        res.status(200).json({
            status:  'success',
            results: cars.length,
            data:    { cars },
        });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────

export const getCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id)
            .populate('location',      'name city address')
            .populate('addedBy',       'name')
            .populate('reviews.user',  'name');

        if (!car) {
            return res.status(404).json({ status: 'fail', message: 'Car not found' });
        }

        // public cannot see removed cars
        const requesterLevel = ROLE_HIERARCHY.indexOf(req.user?.role ?? 'user');
        const isStaff        = requesterLevel >= ROLE_HIERARCHY.indexOf('manager');

        if (!isStaff && car.status === 'removed') {
            return res.status(404).json({ status: 'fail', message: 'Car not found' });
        }

        res.status(200).json({ status: 'success', data: { car } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};

// ─── UPDATE (manager+) ────────────────────────────────────────────────────────

export const updateCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ status: 'fail', message: 'Car not found' });
        }

        const strings = ['manufacturer', 'model', 'color', 'transmission', 'status', 'location'];
        const numbers = ['year', 'seats', 'pricePerDay', 'kilometers'];
        const carData = {};

        strings.forEach((f) => { if (req.body[f] !== undefined) carData[f] = req.body[f]; });
        numbers.forEach((f) => { if (req.body[f] !== undefined) carData[f] = Number(req.body[f]); });

        if (req.body.removeImages) {
            const toRemove = JSON.parse(req.body.removeImages);
            await Promise.all(toRemove.map(deleteFile));
            car.images = car.images.filter((img) => !toRemove.includes(img.fileId));
        }

        if (req.files?.length > 0) {
            const newImages = await uploadCarImages(req.files);
            car.images = [...car.images, ...newImages];
        }

        carData.images = car.images;

        const updated = await Car.findByIdAndUpdate(req.params.id, carData, {
            new: true, runValidators: true,
        });

        res.status(200).json({ status: 'success', data: { car: updated } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── SOFT DELETE → mark as removed (manager+) ────────────────────────────────

export const deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ status: 'fail', message: 'Car not found' });
        }

        // soft delete — preserve rental history
        car.status = 'removed';
        await car.save();

        res.status(200).json({
            status: 'success',
            message: 'Car has been removed from listings',
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── ADD REVIEW (user — only if they have rented this car) ───────────────────

export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ status: 'fail', message: 'Rating and comment are required' });
        }

        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ status: 'fail', message: 'Car not found' });
        }

        // verify user has actually rented this car
        const Rental = (await import('../models/Rental.js')).default;
        const hasRented = await Rental.findOne({
            car:    req.params.id,
            renter: req.user._id,
            status: 'returned',
        });

        if (!hasRented) {
            return res.status(403).json({
                status: 'fail',
                message: 'You can only review cars you have rented',
            });
        }

        // prevent duplicate review for same rental
        const alreadyReviewed = car.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ status: 'fail', message: 'You have already reviewed this car' });
        }

        car.reviews.push({ user: req.user._id, rating: Number(rating), comment });
        await car.save();

        res.status(201).json({ status: 'success', data: { reviews: car.reviews } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};