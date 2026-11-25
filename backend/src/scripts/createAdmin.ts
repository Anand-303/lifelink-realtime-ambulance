import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediconnect';
    await mongoose.connect(mongoUri);
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
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminData.email);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Updated existing user to admin role');
      }
    } else {
      // Create new admin user
      const admin = await User.create(adminData);
      console.log('Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Password: admin123');
      console.log('Role:', admin.role);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
