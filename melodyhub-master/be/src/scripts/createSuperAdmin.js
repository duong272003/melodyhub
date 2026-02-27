// Script to create a Super Admin account
// Usage: node src/scripts/createSuperAdmin.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// ======================================================
// CONFIGURE YOUR SUPER ADMIN CREDENTIALS HERE
// ======================================================
const SUPER_ADMIN = {
    email: 'admin@melodyhub.com',       // Change this to your email
    password: 'Admin@123456',           // Change this to a strong password
    username: 'superadmin',             // Change this to your preferred username
    displayName: 'Super Admin',         // Change this to your display name
};
// ======================================================

const USER_SCHEMA_PERMISSIONS = [
    'manage_users',
    'manage_content',
    'manage_liverooms',
    'handle_support',
    'create_admin',
];

async function createSuperAdmin() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not set in .env file');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 });
        console.log('Connected to MongoDB!');

        // Dynamically import the User model AFTER connecting to avoid issues
        const { default: User } = await import('../models/User.js');

        // Delete any existing account with this email so we can recreate cleanly
        const existingByEmail = await User.findOne({ email: SUPER_ADMIN.email });
        if (existingByEmail) {
            console.log(`Found existing account with email: ${SUPER_ADMIN.email}, deleting and recreating...`);
            await User.deleteOne({ email: SUPER_ADMIN.email });
        }

        // Check if username already exists
        const existingByUsername = await User.findOne({ username: SUPER_ADMIN.username });
        if (existingByUsername) {
            console.error(`\n❌ Username "${SUPER_ADMIN.username}" is already taken. Please choose a different username in the script.`);
            await mongoose.disconnect();
            process.exit(1);
        }

        // Create super admin user
        // NOTE: Do NOT manually hash the password here.
        // The User model pre-save hook will hash the passwordHash field automatically.
        const superAdmin = new User({
            email: SUPER_ADMIN.email,
            passwordHash: SUPER_ADMIN.password, // Will be auto-hashed by model pre-save hook
            username: SUPER_ADMIN.username,
            displayName: SUPER_ADMIN.displayName,
            roleId: 'super_admin',
            permissions: USER_SCHEMA_PERMISSIONS,
            verifiedEmail: true,
            isActive: true,
        });

        await superAdmin.save({ validateBeforeSave: false });

        console.log('\n✅ Super Admin account created successfully!');
        console.log('─────────────────────────────────────');
        console.log(`   Email:       ${SUPER_ADMIN.email}`);
        console.log(`   Password:    ${SUPER_ADMIN.password}`);
        console.log(`   Username:    ${SUPER_ADMIN.username}`);
        console.log(`   Role:        super_admin`);
        console.log(`   Permissions: ${USER_SCHEMA_PERMISSIONS.join(', ')}`);
        console.log('─────────────────────────────────────');
        console.log('\n⚠️  Please change the password after your first login!');

    } catch (error) {
        console.error('\n❌ Error creating Super Admin:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

createSuperAdmin();
