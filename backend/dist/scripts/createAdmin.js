"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Admin user details
        const adminData = {
            name: 'Admin User',
            email: 'admin@mediconnect.com',
            password: 'admin123', // This will be hashed by the pre-save hook
            role: 'admin',
            phone: '+1234567890',
            address: 'Admin Office',
            bloodGroup: 'O+',
            isDonor: false,
        };
        // Check if admin already exists
        const existingAdmin = await User_1.default.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists with email:', adminData.email);
            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('Updated existing user to admin role');
            }
        }
        else {
            // Create new admin user
            const admin = await User_1.default.create(adminData);
            console.log('Admin user created successfully!');
            console.log('Email:', admin.email);
            console.log('Password: admin123');
            console.log('Role:', admin.role);
        }
        // Disconnect from MongoDB
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};
// Run the script
createAdminUser();
//# sourceMappingURL=createAdmin.js.map