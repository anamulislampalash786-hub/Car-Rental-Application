import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    // car belongs to a location (branch), not a user
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Car must belong to a location'],
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // the manager who added it
    },
    manufacturer: { type: String, required: true },
    model:        { type: String, required: true },
    color:        { type: String, required: true },
    year:         { type: Number, required: true },
    transmission: { type: String, enum: ['manual', 'automatic'], required: true },
    seats:        { type: Number, required: true },
    pricePerDay:  { type: Number, required: true },
    kilometers:   { type: Number, required: true },
    status: {
        type: String,
        enum: ['available', 'rented', 'returned', 'removed'],
        default: 'available',
    },
    images: [{
        url:    String,
        fileId: String,
    }],
    reviews: [{
        user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating:    { type: Number, min: 1, max: 5 },
        comment:   String,
        createdAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);
export default Car;