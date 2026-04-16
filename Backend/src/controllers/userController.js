import User from '../models/User.js';

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];

// ─── GET ME ───────────────────────────────────────────────────────────────────

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── UPDATE ME (email and phone only — name is permanent) ─────────────────────

export const updateMe = async (req, res) => {
    try {
        if (req.body.password || req.body.name || req.body.role) {
            return res.status(400).json({
                status: 'fail',
                message: 'You cannot update name, role or password through this route',
            });
        }

        const filteredBody = {};
        ['email', 'phone'].forEach((field) => {
            if (req.body[field] !== undefined) filteredBody[field] = req.body[field];
        });

        const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
            new: true, runValidators: true,
        });

        res.status(200).json({ status: 'success', data: { user: updatedUser } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── UNREGISTER ───────────────────────────────────────────────────────────────

export const unregister = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.cookie('jwt', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ALL USERS (manager+) ─────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
    try {
        const filter = {};

        // ?role=user  or  ?role=manager  etc.
        if (req.query.role) {
            if (!ROLE_HIERARCHY.includes(req.query.role)) {
                return res.status(400).json({ status: 'fail', message: `Invalid role. Must be one of: ${ROLE_HIERARCHY.join(', ')}` });
            }
            filter.role = req.query.role;
        }

        // ?isOwner=true
        if (req.query.isOwner !== undefined) {
            filter.isOwner = req.query.isOwner === 'true';
        }

        // ?isLocked=true
        if (req.query.isLocked !== undefined) {
            filter.isLocked = req.query.isLocked === 'true';
        }

        const users = await User.find(filter).sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── LOCK / UNLOCK USER (manager+) ────────────────────────────────────────────

export const lockUser = async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        const requesterLevel = ROLE_HIERARCHY.indexOf(req.user.role);
        const targetLevel    = ROLE_HIERARCHY.indexOf(target.role);

        if (targetLevel >= requesterLevel) {
            return res.status(403).json({ status: 'fail', message: 'You cannot lock a user with equal or higher role' });
        }

        target.isLocked = !target.isLocked;
        await target.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: `${target.name} has been ${target.isLocked ? 'locked' : 'unlocked'}`,
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── UPDATE ROLE (boss+) ──────────────────────────────────────────────────────

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !ROLE_HIERARCHY.includes(role)) {
            return res.status(400).json({ status: 'fail', message: `Invalid role. Must be one of: ${ROLE_HIERARCHY.join(', ')}` });
        }

        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        const requesterLevel = ROLE_HIERARCHY.indexOf(req.user.role);
        const assignLevel    = ROLE_HIERARCHY.indexOf(role);

        // can only assign roles strictly below your own
        if (assignLevel >= requesterLevel) {
            return res.status(403).json({
                status: 'fail',
                message: `You can only assign roles below your own level (${req.user.role})`,
            });
        }

        target.role = role;
        await target.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: `${target.name}'s role updated to ${role}`,
            data: { role: target.role },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};