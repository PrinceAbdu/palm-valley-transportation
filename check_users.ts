
import mongoose from 'mongoose';
import User from './models/User.model';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const checkUsers = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const emails = [
            'admin@palmvalley.com',
            'driver@palmvalley.com',
            'rider@palmvalley.com'
        ];

        const users = await User.find({ email: { $in: emails } });

        console.log('Found users:', users.map(u => ({
            email: u.email,
            role: u.role,
            isActive: u.isActive
        })));

        if (users.length === 0) {
            console.log('No users found with these emails.');
        } else if (users.length < emails.length) {
            const foundEmails = users.map(u => u.email);
            const missingEmails = emails.filter(e => !foundEmails.includes(e));
            console.log('Missing users:', missingEmails);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

checkUsers();
