import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false,
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
    },
    role: {
        type: String,
        enum: ['user', 'manager', 'boss', 'admin'],
        default: 'user',
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    rentalHistory: [{
        car:        { type: mongoose.Schema.Types.ObjectId, ref: 'Car' },
        rentedAt:   Date,
        returnedAt: Date,
        cost:       Number,
        kmDriven:   Number,
    }],
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;