'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';
import { api } from '@/lib/api';
import Image from 'next/image';

interface Vehicle {
    _id: string;
    name: string;
    type: string;
    description: string;
    maxPassengers: number;
    maxLuggage: number;
    basePrice: number;
    features: string[];
    imageUrl?: string;
}

export default function FleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await api('/api/vehicles');
                const data = await res.json();
                if (data.success) {
                    setVehicles(data.data);
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

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-5xl font-bold mb-6">Our Premium Fleet</h1>
                        <p className="text-xl text-blue-100 max-w-3xl">
                            Discover our selection of meticulously maintained vehicles, each designed to provide
                            comfort, safety, and style for every journey.
                        </p>
                    </div>
                </section>

                {/* Fleet Vehicles */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {vehicles.map((vehicle) => (
                                    <Card key={vehicle._id} variant="elevated" padding="lg">
                                        <div className="grid md:grid-cols-3 gap-8">
                                            <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                                {vehicle.imageUrl ? (
                                                    <Image 
                                                        src={vehicle.imageUrl} 
                                                        alt={vehicle.name} 
                                                        fill
                                                        className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-500"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 500px"
                                                        priority={false}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-8xl">
                                                        {getVehicleEmoji(vehicle.type)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                                                <p className="text-gray-600 mb-4">{vehicle.description}</p>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Passengers</p>
                                                        <p className="font-semibold text-gray-900">Up to {vehicle.maxPassengers}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Luggage</p>
                                                        <p className="font-semibold text-gray-900">Up to {vehicle.maxLuggage} bags</p>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-2">Features:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {vehicle.features.map((feature, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                                                            >
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Starting at</p>
                                                        <p className="text-2xl font-bold text-primary-600">${vehicle.basePrice}</p>
                                                    </div>
                                                    <Link
                                                        href="/booking"
                                                        className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
                                                    >
                                                        Book This Vehicle
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Fleet Features */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">All Vehicles Include</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-4xl mb-3">🛡️</div>
                                <h3 className="font-bold text-gray-900 mb-2">Safety Inspected</h3>
                                <p className="text-sm text-gray-600">Regular maintenance & inspections</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-3">🧼</div>
                                <h3 className="font-bold text-gray-900 mb-2">Professional Cleaning</h3>
                                <p className="text-sm text-gray-600">Sanitized before every trip</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-3">📱</div>
                                <h3 className="font-bold text-gray-900 mb-2">GPS Tracking</h3>
                                <p className="text-sm text-gray-600">Real-time location monitoring</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-3">💼</div>
                                <h3 className="font-bold text-gray-900 mb-2">Professional Drivers</h3>
                                <p className="text-sm text-gray-600">Licensed & background checked</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-primary-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Find Your Perfect Ride</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Whether you need a sedan for business or a van for your group, we have the perfect vehicle.
                        </p>
                        <Link
                            href="/booking"
                            className="inline-block px-8 py-4 bg-secondary-500 text-white font-semibold rounded-lg hover:bg-secondary-600 transition shadow-lg"
                        >
                            Book Now
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
