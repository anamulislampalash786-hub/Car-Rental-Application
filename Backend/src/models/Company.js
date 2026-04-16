import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name:        { type: String, required: true },
    description: { type: String },
    email:       { type: String },
    phone:       { type: String },
    website:     { type: String },
    address:     { type: String },
    logo: {
        url:    String,
        fileId: String,
    },
    foundedYear: { type: Number },
    socialLinks: {
        facebook:  String,
        instagram: String,
        twitter:   String,
        linkedin:  String,
    },
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
export default Company;