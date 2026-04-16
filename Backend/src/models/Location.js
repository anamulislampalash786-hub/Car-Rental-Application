import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a location name'],
        trim: true,
        unique: true,
    },
    city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true,
    },
    country: {
        type: String,
        required: [true, 'Please provide a country'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Please provide an address'],
        trim: true,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);
export default Location;