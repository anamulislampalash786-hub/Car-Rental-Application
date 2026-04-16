import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'You are not logged in' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user    = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
        }
        if (user.isLocked) {
            return res.status(403).json({ status: 'fail', message: 'Your account has been locked' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ status: 'fail', message: 'Invalid token' });
    }
};

// minimum role level
export const atLeast = (minRole) => (req, res, next) => {
    const userLevel = ROLE_HIERARCHY.indexOf(req.user.role);
    const minLevel  = ROLE_HIERARCHY.indexOf(minRole);
    if (userLevel < minLevel) {
        return res.status(403).json({
            status: 'fail',
            message: `This action requires at least ${minRole} access`,
        });
    }
    next();
};

// exact role whitelist
export const restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            status: 'fail',
            message: 'You do not have permission to perform this action',
        });
    }
    next();
};

// must be in hosting mode (admin excluded from hosting)
export const requireHosting = (req, res, next) => {
    if (req.user.role === 'admin') {
        return res.status(403).json({ status: 'fail', message: 'Admins cannot host cars' });
    }
    if (!req.user.isOwner || req.user.activeMode !== 'hosting') {
        return res.status(403).json({ status: 'fail', message: 'Switch to hosting mode first' });
    }
    next();
};

// Attach user if token exists, but don't block if there's no token
export const optionalProtect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user    = await User.findById(decoded.id);
            if (user && !user.isLocked) req.user = user;
        }
    } catch (_) {
        // invalid token — just continue as unauthenticated, don't block
    }
    next();
};