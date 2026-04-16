import Rental   from '../models/Rental.js';
import Car      from '../models/Car.js';
import User     from '../models/User.js';
import Location from '../models/Location.js';

// ─── REQUEST RENTAL (any logged-in user) ──────────────────────────────────────

export const requestRental = async (req, res) => {
    try {
        const { carId, pickupLocationId, startDate, expectedReturnDate } = req.body;

        // 1) validate car
        const car = await Car.findById(carId).populate('location');
        if (!car) {
            return res.status(404).json({ status: 'fail', message: 'Car not found' });
        }
        if (car.status !== 'available') {
            return res.status(400).json({
                status:  'fail',
                message: `Car is currently ${car.status}`,
            });
        }

        // ✅ 2) validate pickup location matches car's location
        if (car.location._id.toString() !== pickupLocationId.toString()) {
            return res.status(400).json({
                status:  'fail',
                message: `This car is only available for pickup at ${car.location.name} — ${car.location.city}`,
            });
        }

        // 3) validate location exists and is active
        const location = await Location.findById(pickupLocationId);
        if (!location || !location.isActive) {
            return res.status(404).json({
                status:  'fail',
                message: 'Location not found or inactive',
            });
        }

        // 3) validate dates
        const start    = new Date(startDate);
        const end      = new Date(expectedReturnDate);
        const today    = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            return res.status(400).json({ status: 'fail', message: 'Start date cannot be in the past' });
        }
        if (end <= start) {
            return res.status(400).json({ status: 'fail', message: 'Return date must be after start date' });
        }

        // 4) check user doesn't already have an active rental
        const activeRental = await Rental.findOne({
            renter: req.user._id,
            status: { $in: ['pending', 'approved', 'active'] },
        });
        if (activeRental) {
            return res.status(400).json({
                status: 'fail',
                message: 'You already have an active or pending rental',
            });
        }

        // 5) calculate cost snapshot
        const days       = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalCost  = days * car.pricePerDay;

        const rental = await Rental.create({
            car:                carId,
            renter:             req.user._id,
            pickupLocation:     pickupLocationId,
            startDate:          start,
            expectedReturnDate: end,
            pricePerDay:        car.pricePerDay,  // snapshot
            totalCost,
            kmAtPickup:         car.kilometers,
            status:             'pending',
        });

        await rental.populate([
            { path: 'car',             select: 'manufacturer model pricePerDay' },
            { path: 'pickupLocation',  select: 'name city' },
        ]);

        res.status(201).json({
            status: 'success',
            message: 'Rental request submitted. Awaiting manager approval.',
            data: { rental },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── APPROVE / REJECT RENTAL (manager+) ───────────────────────────────────────

export const processRental = async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ status: 'fail', message: "action must be 'approve' or 'reject'" });
        }

        const rental = await Rental.findById(req.params.id);
        if (!rental) {
            return res.status(404).json({ status: 'fail', message: 'Rental not found' });
        }
        if (rental.status !== 'pending') {
            return res.status(400).json({
                status: 'fail',
                message: `Rental is already ${rental.status}`,
            });
        }

        if (action === 'approve') {
            rental.status     = 'approved';
            rental.approvedBy = req.user._id;

            // mark car as rented so no one else can request it
            await Car.findByIdAndUpdate(rental.car, { status: 'rented' });
        } else {
            rental.status = 'rejected';
        }

        await rental.save();
        await rental.populate([
            { path: 'car',    select: 'manufacturer model' },
            { path: 'renter', select: 'name email' },
        ]);

        res.status(200).json({
            status: 'success',
            message: `Rental has been ${rental.status}`,
            data: { rental },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── ACTIVATE RENTAL / CAR PICKUP (manager+) ──────────────────────────────────
// called when user physically picks up the car

export const activateRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);
        if (!rental) {
            return res.status(404).json({ status: 'fail', message: 'Rental not found' });
        }

        if (rental.status !== 'approved') {
            return res.status(400).json({
                status:  'fail',
                message: `Rental must be approved before activation. Current status: ${rental.status}`,
            });
        }

        rental.status          = 'active';
        rental.actualPickupDate = new Date(); // ✅ separate field — doesn't affect cost calc
        // ❌ don't touch rental.startDate — it's the user's requested date
        await rental.save();

        res.status(200).json({
            status:  'success',
            message: 'Rental is now active. Car has been picked up.',
            data:    { rental },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── RETURN CAR (manager+) ────────────────────────────────────────────────────

export const returnCar = async (req, res) => {
    try {
        const { returnLocationId, kmAtReturn } = req.body;

        if (!returnLocationId || !kmAtReturn) {
            return res.status(400).json({
                status:  'fail',
                message: 'returnLocationId and kmAtReturn are required',
            });
        }

        const rental = await Rental.findById(req.params.id);
        if (!rental) {
            return res.status(404).json({ status: 'fail', message: 'Rental not found' });
        }
        if (rental.status !== 'active') {
            return res.status(400).json({
                status:  'fail',
                message: `Only active rentals can be returned. Current status: ${rental.status}`,
            });
        }

        const returnLocation = await Location.findById(returnLocationId);
        if (!returnLocation || !returnLocation.isActive) {
            return res.status(404).json({
                status:  'fail',
                message: 'Return location not found or inactive',
            });
        }

        const actualReturnDate = new Date();

        // ✅ use actualPickupDate if available, fallback to startDate
        const pickupDate = rental.actualPickupDate || rental.startDate;

        const actualDays = Math.ceil(
            (actualReturnDate - pickupDate) / (1000 * 60 * 60 * 24)
        );

        // ensure minimum 1 day charge
        const chargeableDays = Math.max(actualDays, 1);
        const finalCost      = chargeableDays * rental.pricePerDay;
        const kmDriven       = Number(kmAtReturn) - rental.kmAtPickup;

        if (kmDriven < 0) {
            return res.status(400).json({
                status:  'fail',
                message: `kmAtReturn (${kmAtReturn}) cannot be less than kmAtPickup (${rental.kmAtPickup})`,
            });
        }

        // update rental
        rental.status           = 'returned';
        rental.actualReturnDate = actualReturnDate;
        rental.returnLocation   = returnLocationId;
        rental.kmAtReturn       = Number(kmAtReturn);
        rental.kmDriven         = kmDriven;
        rental.totalCost        = finalCost;
        await rental.save();

        // update car — mark returned + update km + move to return location
        await Car.findByIdAndUpdate(rental.car, {
            status:     'returned',
            kilometers: Number(kmAtReturn),
            location:   returnLocationId,
        });

        // push to user rental history
        await User.findByIdAndUpdate(rental.renter, {
            $push: {
                rentalHistory: {
                    car:        rental.car,
                    rentedAt:   pickupDate,
                    returnedAt: actualReturnDate,
                    cost:       finalCost,
                    kmDriven,
                },
            },
        });

        await rental.populate([
            { path: 'car',            select: 'manufacturer model' },
            { path: 'renter',         select: 'name email' },
            { path: 'returnLocation', select: 'name city' },
        ]);

        res.status(200).json({
            status:  'success',
            message: 'Car returned successfully',
            data: {
                rental,
                summary: {
                    chargeableDays,
                    kmDriven,
                    finalCost,
                    pickupDate,
                    returnDate: actualReturnDate,
                },
            },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET MY RENTALS (logged-in user) ──────────────────────────────────────────

export const getMyRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ renter: req.user._id })
            .populate('car',            'manufacturer model images')
            .populate('pickupLocation', 'name city')
            .populate('returnLocation', 'name city')
            .sort('-createdAt');

        // rental history stats
        const returned     = rentals.filter((r) => r.status === 'returned');
        const totalKm      = returned.reduce((sum, r) => sum + (r.kmDriven  || 0), 0);
        const totalSpent   = returned.reduce((sum, r) => sum + (r.totalCost || 0), 0);
        const totalRentals = returned.length;

        res.status(200).json({
            status: 'success',
            results: rentals.length,
            data: {
                rentals,
                stats: { totalRentals, totalKm, totalSpent },
            },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ALL RENTALS (manager+) ───────────────────────────────────────────────

export const getAllRentals = async (req, res) => {
    try {
        const filter = {};

        // filter by status — e.g. ?status=pending
        if (req.query.status) filter.status = req.query.status;

        // filter by car
        if (req.query.car) filter.car = req.query.car;

        // filter by renter
        if (req.query.renter) filter.renter = req.query.renter;

        const rentals = await Rental.find(filter)
            .populate('car',            'manufacturer model')
            .populate('renter',         'name email phone')
            .populate('pickupLocation', 'name city')
            .populate('returnLocation', 'name city')
            .populate('approvedBy',     'name role')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: rentals.length,
            data: { rentals },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ONE RENTAL ───────────────────────────────────────────────────────────

export const getRental = async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id)
            .populate('car',            'manufacturer model images pricePerDay')
            .populate('renter',         'name email phone')
            .populate('pickupLocation', 'name city address')
            .populate('returnLocation', 'name city address')
            .populate('approvedBy',     'name role');

        if (!rental) {
            return res.status(404).json({ status: 'fail', message: 'Rental not found' });
        }

        // user can only see their own rental, staff can see all
        const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
        const isStaff = ROLE_HIERARCHY.indexOf(req.user.role) >= ROLE_HIERARCHY.indexOf('manager');

        if (!isStaff && rental.renter._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'You do not have access to this rental' });
        }

        res.status(200).json({ status: 'success', data: { rental } });
    } catch (error) {
        res.status(404).json({ status: 'fail', message: error.message });
    }
};