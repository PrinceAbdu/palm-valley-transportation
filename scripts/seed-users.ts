import mongoose from 'mongoose';
import User from '../models/User.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

const users = [
    {
        email: 'admin@palmvalley.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
    },
    {
        email: 'driver@palmvalley.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Driver',
        phone: '+1987654321',
        role: 'driver',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
    },
    {
        email: 'rider@palmvalley.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Rider',
        phone: '+1122334455',
        role: 'rider',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
    },
];

async function seedUsers() {
    try {
        await mongoose.connect(MONGODB_URI as string, { dbName: 'jacksonville_rides' });
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Insert new users
        await User.create(users);
        console.log('Seeded users successfully');

        console.log('Created Users:');
        users.forEach(user => {
            console.log(`- ${user.role}: ${user.email} (Password: ${user.password})`);
        });

    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedUsers();
