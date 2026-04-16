import Company from '../models/Company.js';
import User    from '../models/User.js';
import { uploadFile, deleteFile } from '../config/imagekit.js';

// ─── GET COMPANY INFO (public — About page) ───────────────────────────────────

export const getCompany = async (req, res) => {
    try {
        const company = await Company.findOne();
        if (!company) {
            return res.status(404).json({ status: 'fail', message: 'Company info not set up yet' });
        }
        res.status(200).json({ status: 'success', data: { company } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ALL BOSSES (public) ──────────────────────────────────────────────────

export const getBosses = async (req, res) => {
    try {
        const bosses = await User.find({ role: 'boss' }).select('name email phone');
        res.status(200).json({
            status: 'success',
            results: bosses.length,
            data: { bosses },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── GET ALL MANAGERS (public) ────────────────────────────────────────────────

export const getManagers = async (req, res) => {
    try {
        const managers = await User.find({ role: 'manager' }).select('name email phone');
        res.status(200).json({
            status: 'success',
            results: managers.length,
            data: { managers },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── CREATE COMPANY INFO (admin only — runs once) ─────────────────────────────

export const createCompany = async (req, res) => {
    try {
        // only one company document should ever exist
        const existing = await Company.findOne();
        if (existing) {
            return res.status(400).json({
                status: 'fail',
                message: 'Company already exists. Use PATCH to update.',
            });
        }

        const companyData = {
            name:        req.body.name,
            description: req.body.description,
            email:       req.body.email,
            phone:       req.body.phone,
            website:     req.body.website,
            address:     req.body.address,
            foundedYear: req.body.foundedYear ? Number(req.body.foundedYear) : undefined,
            socialLinks: {
                facebook:  req.body.facebook,
                instagram: req.body.instagram,
                twitter:   req.body.twitter,
                linkedin:  req.body.linkedin,
            },
        };

        // upload logo if provided
        if (req.file) {
            companyData.logo = await uploadFile(req.file);
        }

        const company = await Company.create(companyData);
        res.status(201).json({ status: 'success', data: { company } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// ─── UPDATE COMPANY INFO (admin only) ────────────────────────────────────────

export const updateCompany = async (req, res) => {
    try {
        const company = await Company.findOne();
        if (!company) {
            return res.status(404).json({ status: 'fail', message: 'Company not found' });
        }

        const allowed = ['name', 'description', 'email', 'phone', 'website', 'address', 'foundedYear'];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) company[field] = req.body[field];
        });

        // social links
        const socials = ['facebook', 'instagram', 'twitter', 'linkedin'];
        socials.forEach((s) => {
            if (req.body[s] !== undefined) company.socialLinks[s] = req.body[s];
        });

        // replace logo if new one uploaded
        if (req.file) {
            if (company.logo?.fileId) await deleteFile(company.logo.fileId);
            company.logo = await uploadFile(req.file);
        }

        await company.save();
        res.status(200).json({ status: 'success', data: { company } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};