import Rental   from '../models/Rental.js';
import Car      from '../models/Car.js';
import User     from '../models/User.js';

// ─── MANAGER STATS ────────────────────────────────────────────────────────────
// Total rentals, most rented cars, revenue trends
// GET /api/v1/stats/manager

export const getManagerStats = async (req, res) => {
    try {
        // 1) overall totals
        const totalRentals = await Rental.countDocuments({ status: 'returned' });
        const totalRevenue = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } },
        ]);

        // 2) rental status breakdown
        const statusBreakdown = await Rental.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // 3) most rented cars (top 5)
        const mostRentedCars = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: {
                    _id:          '$car',
                    totalRentals: { $sum: 1 },
                    totalRevenue: { $sum: '$totalCost' },
                    totalKm:      { $sum: '$kmDriven' },
                }},
            { $sort: { totalRentals: -1 } },
            { $limit: 5 },
            { $lookup: {
                    from:         'cars',
                    localField:   '_id',
                    foreignField: '_id',
                    as:           'car',
                }},
            { $unwind: '$car' },
            { $project: {
                    totalRentals: 1,
                    totalRevenue: 1,
                    totalKm:      1,
                    'car.manufacturer': 1,
                    'car.model':        1,
                    'car.year':         1,
                }},
        ]);

        // 4) monthly revenue trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Rental.aggregate([
            { $match: {
                    status:    'returned',
                    createdAt: { $gte: sixMonthsAgo },
                }},
            { $group: {
                    _id: {
                        year:  { $year:  '$actualReturnDate' },
                        month: { $month: '$actualReturnDate' },
                    },
                    revenue:      { $sum: '$totalCost' },
                    totalRentals: { $sum: 1 },
                }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // 5) cars by status count
        const carStatusBreakdown = await Car.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalRentals,
                totalRevenue:      totalRevenue[0]?.total || 0,
                statusBreakdown,
                mostRentedCars,
                monthlyRevenue,
                carStatusBreakdown,
            },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── BOSS STATS ───────────────────────────────────────────────────────────────
// Everything manager sees + revenue per car + per location
// GET /api/v1/stats/boss

export const getBossStats = async (req, res) => {
    try {
        // 1) total company revenue
        const revenueData = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: {
                    _id:          null,
                    totalRevenue: { $sum: '$totalCost' },
                    totalRentals: { $sum: 1 },
                    totalKm:      { $sum: '$kmDriven' },
                    avgCost:      { $avg: '$totalCost' },
                }},
        ]);

        // 2) revenue per car (all cars)
        const revenuePerCar = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: {
                    _id:          '$car',
                    totalRevenue: { $sum: '$totalCost' },
                    totalRentals: { $sum: 1 },
                    totalKm:      { $sum: '$kmDriven' },
                    avgDailyRate: { $avg: '$pricePerDay' },
                }},
            { $sort: { totalRevenue: -1 } },
            { $lookup: {
                    from:         'cars',
                    localField:   '_id',
                    foreignField: '_id',
                    as:           'car',
                }},
            { $unwind: '$car' },
            { $project: {
                    totalRevenue: 1,
                    totalRentals: 1,
                    totalKm:      1,
                    avgDailyRate: 1,
                    'car.manufacturer': 1,
                    'car.model':        1,
                    'car.year':         1,
                    'car.status':       1,
                }},
        ]);

        // 3) revenue per location
        const revenuePerLocation = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: {
                    _id:          '$pickupLocation',
                    totalRevenue: { $sum: '$totalCost' },
                    totalRentals: { $sum: 1 },
                }},
            { $sort: { totalRevenue: -1 } },
            { $lookup: {
                    from:         'locations',
                    localField:   '_id',
                    foreignField: '_id',
                    as:           'location',
                }},
            { $unwind: '$location' },
            { $project: {
                    totalRevenue: 1,
                    totalRentals: 1,
                    'location.name': 1,
                    'location.city': 1,
                }},
        ]);

        // 4) yearly revenue comparison
        const yearlyRevenue = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: {
                    _id:          { year: { $year: '$actualReturnDate' } },
                    totalRevenue: { $sum: '$totalCost' },
                    totalRentals: { $sum: 1 },
                }},
            { $sort: { '_id.year': 1 } },
        ]);

        // 5) top spending users
        const topUsers = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: {
                    _id:          '$renter',
                    totalSpent:   { $sum: '$totalCost' },
                    totalRentals: { $sum: 1 },
                    totalKm:      { $sum: '$kmDriven' },
                }},
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            { $lookup: {
                    from:         'users',
                    localField:   '_id',
                    foreignField: '_id',
                    as:           'user',
                }},
            { $unwind: '$user' },
            { $project: {
                    totalSpent:   1,
                    totalRentals: 1,
                    totalKm:      1,
                    'user.name':  1,
                    'user.email': 1,
                }},
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                overview:          revenueData[0] || {},
                revenuePerCar,
                revenuePerLocation,
                yearlyRevenue,
                topUsers,
            },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
// Full system overview
// GET /api/v1/stats/admin

export const getAdminStats = async (req, res) => {
    try {
        // system counts
        const [
            totalUsers,
            totalCars,
            totalRentals,
            totalLocations,
            lockedUsers,
            activeRentals,
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Car.countDocuments({ status: { $ne: 'removed' } }),
            Rental.countDocuments(),
            (await import('../models/Location.js')).default.countDocuments({ isActive: true }),
            User.countDocuments({ isLocked: true }),
            Rental.countDocuments({ status: 'active' }),
        ]);

        // user role breakdown
        const userRoleBreakdown = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // total revenue
        const revenueData = await Rental.aggregate([
            { $match: { status: 'returned' } },
            { $group: {
                    _id:          null,
                    totalRevenue: { $sum: '$totalCost' },
                    avgRentalCost: { $avg: '$totalCost' },
                }},
        ]);

        // new users per month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const newUsersMonthly = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: {
                    _id: {
                        year:  { $year:  '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                }},
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                counts: {
                    totalUsers,
                    totalCars,
                    totalRentals,
                    totalLocations,
                    lockedUsers,
                    activeRentals,
                },
                userRoleBreakdown,
                revenue:        revenueData[0] || {},
                newUsersMonthly,
            },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};