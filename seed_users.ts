
import mongoose from 'mongoose';
import User from './models/User.model';
import Driver from './models/Driver.model';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const seedUsers = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = [
            {
                email: 'admin@palmvalley.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                phone: '904-555-0001',
                role: 'admin',
                isActive: true,
                isEmailVerified: true,
                isPhoneVerified: true
            },
            {
                email: 'driver@palmvalley.com',
                password: 'driver123',
                firstName: 'John',
                lastName: 'Driver',
                phone: '904-555-0002',
                role: 'driver',
                isActive: true,
                isEmailVerified: true,
                isPhoneVerified: true
            },
            {
                email: 'rider@palmvalley.com',
                password: 'rider123',
                firstName: 'Jane',
                lastName: 'Rider',
                phone: '904-555-0003',
                role: 'rider',
                isActive: true,
                isEmailVerified: true,
                isPhoneVerified: true
            }
        ];

        for (const userData of users) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                user = await User.create(userData);
                console.log(`Created user: ${user.email}`);

                if (user.role === 'driver') {
                    await Driver.create({
                        userId: user._id,
                        licenseNumber: 'FL-DRV-ADFCFB',
                        licenseExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                        status: 'approved',
                        isAvailable: true,
                        rating: 5,
                        totalRides: 0
                    });
                    console.log(`Created driver profile for: ${user.email}`);
                }
            } else {
                console.log(`User already exists: ${user.email}`);
            }
        }

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedUsers();
