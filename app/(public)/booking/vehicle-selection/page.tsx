'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

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

export default function VehicleSelectionPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [bookingNumber, setBookingNumber] = useState('');

    useEffect(() => {
        const data = sessionStorage.getItem('bookingData');
        if (!data) {
            router.push('/booking');
            return;
        }
        setBookingData(JSON.parse(data));
        fetchVehicles();
    }, [router]);

    const fetchVehicles = async () => {
        try {
            const res = await api('/api/vehicles');
            const result = await res.json();
            if (result.success) {
                setVehicles(result.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVehicleEmoji = (type: string) => {
        switch (type) {
            case 'sedan': return '🚗';
            case 'suv': return '🚙';
            case 'van': return '🚐';
            case 'luxury': return '🚌';
            default: return '🚗';
        }
    };

    const handleSelectVehicle = async (vehicleId: string) => {
        if (!bookingData) return;
        setSubmitting(true);

        try {
            const payload: any = {
                vehicleId,
                tripType: bookingData.tripType,
                pickup: {
                    address: bookingData.pickupAddress,
                    lat: bookingData.pickupLat || 0,
                    lng: bookingData.pickupLng || 0,
                    notes: bookingData.pickupNotes,
                },
                dropoff: bookingData.dropoffAddress ? {
                    address: bookingData.dropoffAddress,
                    lat: bookingData.dropoffLat || 0,
                    lng: bookingData.dropoffLng || 0,
                } : undefined,
                scheduledDate: bookingData.scheduledDate,
                scheduledTime: bookingData.scheduledTime,
                passengers: bookingData.passengers,
                luggage: bookingData.luggage,
                isAirportRide: bookingData.isAirportRide,
                flightNumber: bookingData.flightNumber,
                meetAndGreet: bookingData.meetAndGreet,
                hours: bookingData.hours,
            };

            // Add user or guest info
            if (user) {
                payload.riderId = user._id || user.id;
            } else {
                payload.guestName = bookingData.guestName;
                payload.guestEmail = bookingData.guestEmail;
                payload.guestPhone = bookingData.guestPhone;
            }

            const token = localStorage.getItem('token');
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await api('/api/bookings', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.success) {
                setBookingNumber(result.data.bookingNumber);
                setSubmitted(true);
                // Clear session data
                sessionStorage.removeItem('bookingData');
            } else {
                alert(result.error || 'Failed to submit booking');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('Failed to submit booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Confirmation screen after booking is submitted
    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-1 py-12">
                    <div className="max-w-2xl mx-auto px-4 text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="text-6xl mb-6">✅</div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Submitted!</h1>
                            <p className="text-xl text-gray-600 mb-6">
                                Your booking <strong className="text-primary-600">{bookingNumber}</strong> has been received.
                            </p>
                            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                                <h3 className="font-bold text-gray-900 mb-3">What happens next?</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary-500 mt-0.5">1️⃣</span>
                                        <span className="text-gray-700">Our team will review your booking details</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary-500 mt-0.5">2️⃣</span>
                                        <span className="text-gray-700">You'll receive a price quote via email within 1–2 hours</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary-500 mt-0.5">3️⃣</span>
                                        <span className="text-gray-700">Pay securely with the Stripe payment link in the email</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary-500 mt-0.5">4️⃣</span>
                                        <span className="text-gray-700">We'll assign a driver and confirm your ride!</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <Button onClick={() => router.push('/')}>
                                    Back to Home
                                </Button>
                                {user && (
                                    <Button variant="outline" onClick={() => router.push('/dashboard')}>
                                        View My Bookings
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4">Select Your Vehicle</h1>
                        <p className="text-xl text-gray-600">Choose the vehicle that best fits your needs</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-success-500 text-white flex items-center justify-center font-semibold">
                                    ✓
                                </div>
                                <span className="ml-2 text-gray-500">Trip Details</span>
                            </div>
                            <div className="w-16 h-1 bg-primary-500"></div>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                                    2
                                </div>
                                <span className="ml-2 font-medium text-primary-600">Vehicle</span>
                            </div>
                            <div className="w-16 h-1 bg-gray-300"></div>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                                    3
                                </div>
                                <span className="ml-2 text-gray-500">Confirmation</span>
                            </div>
                        </div>
                    </div>

                    {/* Submitting overlay */}
                    {submitting && (
                        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
                                <Spinner size="lg" />
                                <p className="mt-4 text-gray-700 font-medium">Submitting your booking...</p>
                            </div>
                        </div>
                    )}

                    {/* Trip Summary (sticky sidebar on desktop) */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {/* Vehicles */}
                            <div className="space-y-6">
                                {vehicles.map(vehicle => {
                                    const canAccommodate =
                                        bookingData &&
                                        vehicle.maxPassengers >= bookingData.passengers &&
                                        vehicle.maxLuggage >= bookingData.luggage;

                                    return (
                                        <Card
                                            key={vehicle._id}
                                            variant="bordered"
                                            padding="lg"
                                            className={!canAccommodate ? 'opacity-50' : ''}
                                        >
                                            <div className="grid md:grid-cols-3 gap-6 items-center">
                                                {/* Vehicle Image */}
                                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-40 flex items-center justify-center text-5xl">
                                                    {vehicle.imageUrl ? (
                                                        <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        getVehicleEmoji(vehicle.type)
                                                    )}
                                                </div>

                                                {/* Vehicle Details */}
                                                <div className="md:col-span-2">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold mb-1">{vehicle.name}</h3>
                                                            <p className="text-gray-600">{vehicle.description}</p>
                                                        </div>
                                                        {vehicle.type === 'suv' && (
                                                            <span className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                                Popular
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Capacity */}
                                                    <div className="flex items-center gap-6 mb-4 text-gray-700">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">👥</span>
                                                            <span className="text-sm font-medium">
                                                                Up to {vehicle.maxPassengers} passengers
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">🧳</span>
                                                            <span className="text-sm font-medium">
                                                                Up to {vehicle.maxLuggage} bags
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Features */}
                                                    <div className="mb-4">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {vehicle.features.map((feature, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                                                                >
                                                                    {feature}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Price & Action */}
                                                    <div className="flex items-center justify-between pt-4 border-t">
                                                        <div>
                                                            <p className="text-sm text-gray-600">Starting at</p>
                                                            <p className="text-3xl font-bold text-primary-600">
                                                                ${vehicle.basePrice}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            onClick={() => handleSelectVehicle(vehicle._id)}
                                                            disabled={!canAccommodate || submitting}
                                                            variant="primary"
                                                            size="lg"
                                                        >
                                                            {canAccommodate ? 'Select & Submit' : 'Too Small'}
                                                        </Button>
                                                    </div>

                                                    {!canAccommodate && (
                                                        <p className="text-sm text-danger-600 mt-2">
                                                            This vehicle cannot accommodate your passenger/luggage requirements
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Trip Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <Card variant="elevated" padding="lg" className="sticky top-24">
                                <h3 className="text-xl font-bold mb-4">Trip Summary</h3>
                                {bookingData && (
                                    <div className="space-y-3 text-sm">
                                        {/* Guest info */}
                                        {bookingData.guestName && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-primary-500">👤</span>
                                                <div>
                                                    <p className="font-medium">Guest</p>
                                                    <p className="text-gray-600">{bookingData.guestName}</p>
                                                    <p className="text-gray-600">{bookingData.guestEmail}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary-500">📍</span>
                                            <div>
                                                <p className="font-medium">Pickup</p>
                                                <p className="text-gray-600">{bookingData.pickupAddress}</p>
                                            </div>
                                        </div>
                                        {bookingData.dropoffAddress && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-primary-500">🎯</span>
                                                <div>
                                                    <p className="font-medium">Drop-off</p>
                                                    <p className="text-gray-600">{bookingData.dropoffAddress}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary-500">📅</span>
                                            <div>
                                                <p className="font-medium">Date & Time</p>
                                                <p className="text-gray-600">
                                                    {bookingData.scheduledDate} at {bookingData.scheduledTime}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary-500">👥</span>
                                            <div>
                                                <p className="font-medium">Passengers & Luggage</p>
                                                <p className="text-gray-600">
                                                    {bookingData.passengers} passengers, {bookingData.luggage} bags
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6 pt-6 border-t">
                                    <p className="text-xs text-gray-500 mb-4">
                                        💡 Select a vehicle to submit your booking. You'll receive a price quote via email.
                                    </p>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/booking')}
                                        className="w-full"
                                    >
                                        ← Edit Details
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
