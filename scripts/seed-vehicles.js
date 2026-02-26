// Seed script to populate vehicles in database
// Run this once: node scripts/seed-vehicles.js

import connectDB from '../lib/mongodb.js';
import Vehicle from '../models/Vehicle.model.js';

const vehicles = [
    {
        name: 'Luxury Sedan',
        type: 'sedan',
        description: 'Perfect for business travel and airport transfers',
        maxPassengers: 4,
        maxLuggage: 3,
        features: ['Leather Seats', 'Climate Control', 'Premium Sound', 'WiFi', 'Phone Chargers'],
        basePrice: 50,
        priceMultiplier: 1.0,
        image: '',
        status: 'active',
    },
    {
        name: 'Premium SUV',
        type: 'suv',
        description: 'Ideal for families and small groups',
        maxPassengers: 6,
        maxLuggage: 5,
        features: ['Spacious Interior', 'Third Row Seating', 'Entertainment System', 'WiFi', 'Climate Control'],
        basePrice: 75,
        priceMultiplier: 1.5,
        image: '',
        status: 'active',
    },
    {
        name: 'Executive Van',
        type: 'van',
        description: 'Great for group travel and events',
        maxPassengers: 10,
        maxLuggage: 8,
        features: ['Captain Chairs', 'Entertainment', 'Ample Storage', 'WiFi', 'USB Ports'],
        basePrice: 100,
        priceMultiplier: 2.0,
        image: '',
        status: 'active',
    },
    {
        name: 'Luxury Sprinter',
        type: 'luxury',
        description: 'Ultimate comfort for special occasions',
        maxPassengers: 12,
        maxLuggage: 10,
        features: ['Leather Recliners', 'Premium Bar', 'LED Ambient Lighting', 'WiFi', 'Entertainment'],
        basePrice: 150,
        priceMultiplier: 2.5,
        image: '',
        status: 'active',
    },
];

async function seedVehicles() {
    try {
        await connectDB();

        console.log('🔄 Seeding vehicles...');

        // Clear existing vehicles
        await Vehicle.deleteMany({});
        console.log('✅ Cleared existing vehicles');

        // Insert new vehicles
        const created = await Vehicle.insertMany(vehicles);
        console.log(`✅ Created ${created.length} vehicles:`);
        created.forEach(v => console.log(`   - ${v.name} (${v.type})`));

        console.log('\n🎉 Vehicle seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding vehicles:', error);
        process.exit(1);
    }
}

seedVehicles();
