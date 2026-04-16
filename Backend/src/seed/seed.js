import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import config from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

dns.setServers(['1.1.1.1', '8.8.8.8']);
console.log('🔎 Using custom DNS servers for SRV lookup:', dns.getServers());

// ─── Models ───────────────────────────────────────────────────────────────────

import '../models/User.js';
import '../models/Car.js';
import '../models/Location.js';
import '../models/Rental.js';
import '../models/Company.js';

const User     = mongoose.model('User');
const Car      = mongoose.model('Car');
const Location = mongoose.model('Location');
const Company  = mongoose.model('Company');

// ─── Connect ──────────────────────────────────────────────────────────────────

await mongoose.connect(config.MONGO_URI);
console.log('✅ Connected to MongoDB');

// ─── Clear all ────────────────────────────────────────────────────────────────

const clearAll = async () => {
    await Promise.all([
        User.deleteMany(),
        Car.deleteMany(),
        Location.deleteMany(),
        Company.deleteMany(),
    ]);
    console.log('🗑  Cleared all existing data');
};

// ─── Company ──────────────────────────────────────────────────────────────────

const seedCompany = async () => {
    await Company.create({
        name:        'Drive with Palash',
        description: "Sweden and Norway's premier cross-border car rental service. From the streets of Stockholm to the fjords of Bergen, we keep you moving in style and comfort across Scandinavia.",
        email:       'contact@drivepalash.se',
        phone:       '+46 8 100 2000',
        website:     'https://www.drivepalash.se',
        address:     'Kungsgatan 12, 111 43 Stockholm, Sweden',
        foundedYear: 2012,
        socialLinks: {
            facebook:  'https://facebook.com/drivenorth',
            instagram: 'https://instagram.com/drivenorth',
            twitter:   'https://twitter.com/drivenorth',
            linkedin:  'https://linkedin.com/company/drivenorth',
        },
    });
    console.log('✅ Company seeded — Drive with Palash');
};

// ─── Users ────────────────────────────────────────────────────────────────────

const seedUsers = async () => {
    const usersData = [
        {
            name:     'Erik Lindqvist',
            email:    'admin@drivenorth.se',
            password: 'admin123',
            phone:    '+46 70 000 0001',
            role:     'admin',
        },
        {
            name:     'Astrid Bergström',
            email:    'boss@drivenorth.se',
            password: 'boss1234',
            phone:    '+46 73 111 2222',
            role:     'boss',
        },
        {
            name:     'Lars Johansson',
            email:    'manager.sthlm@drivenorth.se',
            password: 'manager123',
            phone:    '+46 76 333 4444',
            role:     'manager',
        },
        {
            name:     'Ingrid Nilsson',
            email:    'manager.gbg@drivenorth.se',
            password: 'manager123',
            phone:    '+46 79 555 6666',
            role:     'manager',
        },
        {
            name:     'Björn Andersson',
            email:    'user@drivenorth.se',
            password: 'user1234',
            phone:    '+46 72 777 8888',
            role:     'user',
        },
    ];

    const created = [];
    for (const u of usersData) {
        const user = await User.create(u);
        created.push(user);
        console.log(`👤 Created: ${user.name} (${user.role})`);
    }

    return created;
};

// ─── Locations ────────────────────────────────────────────────────────────────

const locationData = [
    {
        name:    'Stockholm Central Station',
        city:    'Stockholm',
        country: 'Sweden',
        address: 'Vasagatan 1, 111 20 Stockholm',
        phone:   '+46 8 100 2001',
        email:   'stockholm@drivenorth.se',
    },
    {
        name:    'Gothenburg Harbour',
        city:    'Gothenburg',
        country: 'Sweden',
        address: 'Skeppsbron 3, 411 21 Gothenburg',
        phone:   '+46 31 100 2002',
        email:   'gothenburg@drivenorth.se',
    },
    {
        name:    'Malmö City',
        city:    'Malmö',
        country: 'Sweden',
        address: 'Stortorget 1, 211 22 Malmö',
        phone:   '+46 40 100 2003',
        email:   'malmo@drivenorth.se',
    },
    {
        name:    'Oslo Central Hub',
        city:    'Oslo',
        country: 'Norway',
        address: 'Jernbanetorget 1, 0154 Oslo',
        phone:   '+47 21 100 2004',
        email:   'oslo@drivenorth.se',
    },
    {
        name:    'Bergen Waterfront',
        city:    'Bergen',
        country: 'Norway',
        address: 'Torget 4, 5014 Bergen',
        phone:   '+47 55 100 2005',
        email:   'bergen@drivenorth.se',
    },
    {
        name:    'Copenhagen Airport',
        city:    'Copenhagen',
        country: 'Denmark',
        address: 'Lufthavnsboulevarden 6, 2770 Kastrup',
        phone:   '+45 32 100 2006',
        email:   'copenhagen@drivenorth.se',
    },
];

// ─── Cars per location ────────────────────────────────────────────────────────

const carsTemplate = (locationId, managerId) => [
    {
        manufacturer: 'Volvo',
        model:        'XC40',
        color:        'Crystal White',
        year:         2023,
        transmission: 'automatic',
        seats:        5,
        pricePerDay:  72,
        kilometers:   11000,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
    {
        manufacturer: 'Volvo',
        model:        'S90',
        color:        'Denim Blue',
        year:         2022,
        transmission: 'automatic',
        seats:        5,
        pricePerDay:  95,
        kilometers:   22000,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
    {
        manufacturer: 'SEAT',
        model:        'Ibiza',
        color:        'Nevada White',
        year:         2023,
        transmission: 'manual',
        seats:        5,
        pricePerDay:  36,
        kilometers:   14000,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
    {
        manufacturer: 'Audi',
        model:        'A4',
        color:        'Daytona Grey',
        year:         2022,
        transmission: 'automatic',
        seats:        5,
        pricePerDay:  105,
        kilometers:   19000,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
    {
        manufacturer: 'Toyota',
        model:        'RAV4',
        color:        'Magnetic Grey',
        year:         2023,
        transmission: 'automatic',
        seats:        5,
        pricePerDay:  78,
        kilometers:   8500,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
    {
        manufacturer: 'Peugeot',
        model:        '308',
        color:        'Perla Nera Black',
        year:         2022,
        transmission: 'manual',
        seats:        5,
        pricePerDay:  44,
        kilometers:   27000,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
    {
        manufacturer: 'BMW',
        model:        '5 Series',
        color:        'Sophisto Grey',
        year:         2023,
        transmission: 'automatic',
        seats:        5,
        pricePerDay:  140,
        kilometers:   5500,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
    {
        manufacturer: 'Renault',
        model:        'Kadjar',
        color:        'Iron Blue',
        year:         2022,
        transmission: 'automatic',
        seats:        5,
        pricePerDay:  58,
        kilometers:   32000,
        status:       'available',
        location:     locationId,
        addedBy:      managerId,
    },
];

// ─── Seed locations + cars ────────────────────────────────────────────────────

const seedLocationsAndCars = async (managerId) => {
    for (const locData of locationData) {
        const location = await Location.create(locData);
        console.log(`📍 Created: ${location.name}`);

        const cars = carsTemplate(location._id, managerId);
        await Car.insertMany(cars);
        console.log(`   🚗 Added ${cars.length} cars`);
    }
    console.log('✅ Locations and cars seeded');
};

// ─── Run ──────────────────────────────────────────────────────────────────────

const run = async () => {
    try {
        await clearAll();

        const users   = await seedUsers();
        const manager = users.find((u) => u.role === 'manager');

        await seedCompany();
        await seedLocationsAndCars(manager._id);

        console.log('\n🎉 Seed complete!');
        console.log('─────────────────────────────────────────────────');
        console.log('Company:   DriveNorth Oy');
        console.log(`Locations: ${locationData.length} (Sweden, Norway, Denmark)`);
        console.log(`Cars:      ${locationData.length * 8} (8 per branch)`);
        console.log(`Users:     ${users.length}`);
        console.log('─────────────────────────────────────────────────');
        console.log('\n📋 Login credentials:');
        console.log('  Admin:   admin@drivenorth.se          / admin123');
        console.log('  Boss:    boss@drivenorth.se           / boss1234');
        console.log('  Manager: manager.sthlm@drivenorth.se  / manager123');
        console.log('  Manager: manager.gbg@drivenorth.se    / manager123');
        console.log('  User:    user@drivenorth.se           / user1234');
        console.log('─────────────────────────────────────────────────');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

run();