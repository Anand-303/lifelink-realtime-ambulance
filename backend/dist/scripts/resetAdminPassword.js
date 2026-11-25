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
const resetAdminPassword = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Find admin user
        const admin = await User_1.default.findOne({ email: 'admin@mediconnect.com' });
        if (!admin) {
            console.log('Admin user not found. Creating new admin...');
            const newAdmin = await User_1.default.create({
                name: 'Admin User',
                email: 'admin@mediconnect.com',
                password: 'admin123',
                role: 'admin',
                phone: '+1234567890',
                address: 'Admin Office',
                bloodGroup: 'O+',
                isDonor: false,
            });
            console.log('Admin user created successfully!');
            console.log('Email:', newAdmin.email);
            console.log('Password: admin123');
        }
        else {
            console.log('Admin user found. Resetting password...');
            // Reset password - the pre-save hook will hash it
            admin.password = 'admin123';
            admin.role = 'admin'; // Ensure role is set
            await admin.save();
            console.log('Admin password reset successfully!');
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
        console.error('Error resetting admin password:', error);
        process.exit(1);
    }
};
// Run the script
resetAdminPassword();
//# sourceMappingURL=resetAdminPassword.js.map