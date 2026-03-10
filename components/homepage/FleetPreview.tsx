'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Vehicle {
    _id: string;
    name: string;
    type: string;
    order?: number;
    maxPassengers: number;
    maxLuggage: number;
    basePrice: number;
    features: string[];
    imageUrl?: string;
    description: string;
}

export default function FleetPreview() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await api('/api/vehicles');
                const data = await res.json();
                if (data.success) {
                    const sorted = [...data.data].sort(
                        (a: Vehicle, b: Vehicle) => (a.order ?? 0) - (b.order ?? 0)
                    );
                    setVehicles(sorted.slice(0, 3)); // Show max 3 on homepage
                }
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const getVehicleEmoji = (type: string) => {
        switch (type) {
            case 'sedan': return '🚗';
            case 'suv': return '🚙';
            case 'van': return '🚐';
            case 'luxury': return '🚌';
            default: return '🚗';
        }
    };

    if (loading || vehicles.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Fleet</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose from our selection of well-maintained, comfortable vehicles
                    </p>
                </div>

                <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    {vehicles.map((vehicle, index) => (
                        <div
                            key={vehicle._id}
                            className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary-500 transition group relative flex-shrink-0 w-[88%] sm:w-[72%] md:w-auto"
                        >
                            {index === 1 && (
                                <div className="absolute top-4 right-4 bg-secondary-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                                    Most Popular
                                </div>
                            )}

                            {/* Image */}
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-60 md:h-48 flex items-center justify-center text-7xl">
                                {vehicle.imageUrl ? (
                                    <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                                ) : (
                                    getVehicleEmoji(vehicle.type)
                                )}
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                                    <p className="text-gray-600">{vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}</p>
                                </div>

                                {/* Capacity */}
                                <div className="flex items-center gap-6 mb-4 text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">👥</span>
                                        <span className="text-sm font-medium">{vehicle.maxPassengers} passengers</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🧳</span>
                                        <span className="text-sm font-medium">{vehicle.maxLuggage} bags</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                                    <ul className="space-y-1">
                                        {vehicle.features.slice(0, 4).map((feature, idx) => (
                                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="text-success-500">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Pricing */}
                                <div className="border-t pt-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Starting at</p>
                                        <p className="text-3xl font-bold text-primary-600">${vehicle.basePrice}</p>
                                    </div>
                                    <Link
                                        href="/booking"
                                        className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition shadow-premium"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/fleet"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
                    >
                        View Full Fleet Details
                        <span>→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
