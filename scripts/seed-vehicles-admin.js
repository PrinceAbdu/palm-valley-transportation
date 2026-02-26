#!/usr/bin/env node

/**
 * Seed vehicles script
 * Run this after logging in as admin to populate the database with sample vehicles
 * Usage: node scripts/seed-vehicles-admin.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function seedVehicles() {
  try {
    console.log('🚗 Starting vehicle seed...');

    // Get token from environment or prompt user
    const token = process.env.ADMIN_TOKEN;
    if (!token) {
      console.error('❌ Please set ADMIN_TOKEN environment variable');
      console.log('Usage: ADMIN_TOKEN=your_token node scripts/seed-vehicles-admin.js');
      process.exit(1);
    }

    console.log(`📡 Calling ${API_URL}/api/admin/seed/vehicles...`);

    const response = await fetch(`${API_URL}/api/admin/seed/vehicles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Vehicles seeded successfully!');
      console.log(`📊 Created ${data.data?.length || 0} vehicles:`);
      data.data?.forEach((vehicle: any) => {
        console.log(`  - ${vehicle.name} (${vehicle.type})`);
      });
    } else {
      console.error('❌ Seed failed:', data.error);
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedVehicles();
