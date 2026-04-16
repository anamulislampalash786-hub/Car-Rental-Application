import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: [true, 'Rental must belong to a car'],
    },
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Rental must belong to a user'],
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    pickupLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Please provide a pickup location'],
    },
    returnLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'active', 'returned', 'rejected'],
        default: 'pending',
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide a start date'],
    },
    expectedReturnDate: {
        type: Date,
        required: [true, 'Please provide an expected return date'],
    },
    actualPickupDate: {
        type: Date,
        default: null,
    },
    actualReturnDate: {
        type: Date,
        default: null,
    },
    pricePerDay: {
        type: Number,  // snapshot from car at time of rental
    },
    totalCost: {
        type: Number,
        default: 0,
    },
    kmAtPickup: {
        type: Number,
        default: 0,
    },
    kmAtReturn: {
        type: Number,
        default: null,
    },
    kmDriven: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;