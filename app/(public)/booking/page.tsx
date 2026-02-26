'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LocationPicker from '@/components/maps/LocationPicker';
import { TRIP_TYPES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

function BookingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        tripType: TRIP_TYPES.ONE_WAY as 'one_way' | 'round_trip' | 'hourly',
        pickupAddress: '',
        pickupLat: 0,
        pickupLng: 0,
        pickupNotes: '',
        dropoffAddress: '',
        dropoffLat: 0,
        dropoffLng: 0,
        scheduledDate: '',
        scheduledTime: '',
        passengers: 1,
        luggage: 0,
        isAirportRide: false,
        flightNumber: '',
        meetAndGreet: false,
        hours: 2,
        // Guest info
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        specialItems: {
            carSeat: false,
            wheelchair: false,
            pets: false,
        },
    });

    // Load data from URL parameters
    useEffect(() => {
        const pickup = searchParams.get('pickup');
        const dropoff = searchParams.get('dropoff');
        const date = searchParams.get('date');
        const time = searchParams.get('time');

        if (pickup || dropoff || date || time) {
            setFormData(prev => ({
                ...prev,
                pickupAddress: pickup || prev.pickupAddress,
                dropoffAddress: dropoff || prev.dropoffAddress,
                scheduledDate: date || prev.scheduledDate,
                scheduledTime: time || prev.scheduledTime,
            }));
        }
    }, [searchParams]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const isGuest = !user;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const incrementValue = (field: string) => {
        setFormData(prev => ({ ...prev, [field]: (prev[field as keyof typeof prev] as number) + 1 }));
    };

    const decrementValue = (field: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: Math.max(field === 'passengers' ? 1 : 0, (prev[field as keyof typeof prev] as number) - 1),
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.pickupAddress) newErrors.pickupAddress = 'Pickup location is required';
        if (formData.tripType !== TRIP_TYPES.HOURLY && !formData.dropoffAddress) {
            newErrors.dropoffAddress = 'Drop-off location is required';
        }
        if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required';
        if (!formData.scheduledTime) newErrors.scheduledTime = 'Time is required';

        // Guest validation
        if (isGuest) {
            if (!formData.guestName) newErrors.guestName = 'Name is required';
            if (!formData.guestEmail) newErrors.guestEmail = 'Email is required';
            if (!formData.guestPhone) newErrors.guestPhone = 'Phone is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            sessionStorage.setItem('bookingData', JSON.stringify(formData));
            router.push('/booking/vehicle-selection');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4">Book Your Ride</h1>
                        <p className="text-xl text-gray-600">Complete your trip details to get started</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                                    1
                                </div>
                                <span className="ml-2 font-medium text-primary-600">Trip Details</span>
                            </div>
                            <div className="w-16 h-1 bg-gray-300"></div>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">
                                    2
                                </div>
                                <span className="ml-2 text-gray-500">Vehicle</span>
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
                        {/* Guest Info Section (shown when not logged in) */}
                        {isGuest && (
                            <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Contact Information</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    No account needed! We'll use this info to send you your ride quote.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Full Name"
                                        name="guestName"
                                        value={formData.guestName}
                                        onChange={handleInputChange}
                                        placeholder="John Smith"
                                        error={errors.guestName}
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        name="guestEmail"
                                        value={formData.guestEmail}
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                        error={errors.guestEmail}
                                        required
                                    />
                                    <Input
                                        label="Phone"
                                        type="tel"
                                        name="guestPhone"
                                        value={formData.guestPhone}
                                        onChange={handleInputChange}
                                        placeholder="(904) 555-0123"
                                        error={errors.guestPhone}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    Already have an account? <a href="/login" className="text-primary-600 font-medium hover:underline">Log in</a> to track your bookings.
                                </p>
                            </div>
                        )}

                        {/* Trip Type */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Trip Type</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: TRIP_TYPES.ONE_WAY, label: 'One-Way' },
                                    { value: TRIP_TYPES.ROUND_TRIP, label: 'Round-Trip' },
                                    { value: TRIP_TYPES.HOURLY, label: 'Hourly' },
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, tripType: type.value }))}
                                        className={`px-4 py-3 rounded-lg border-2 font-medium transition ${formData.tripType === type.value
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pickup Location - Google Maps Autocomplete */}
                        <div className="mb-6">
                            <LocationPicker
                                label="Pickup Location"
                                value={formData.pickupAddress}
                                onChange={(address, lat, lng) => setFormData(prev => ({
                                    ...prev,
                                    pickupAddress: address,
                                    pickupLat: lat,
                                    pickupLng: lng,
                                }))}
                                placeholder="Enter pickup address..."
                                required
                            />
                            {errors.pickupAddress && (
                                <p className="text-sm text-red-500 mt-1">{errors.pickupAddress}</p>
                            )}
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pickup Notes (Optional)
                                </label>
                                <textarea
                                    name="pickupNotes"
                                    value={formData.pickupNotes}
                                    onChange={handleInputChange}
                                    placeholder="Gate code, building name, special instructions..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Dropoff Location (if not hourly) */}
                        {formData.tripType !== TRIP_TYPES.HOURLY && (
                            <div className="mb-6">
                                <LocationPicker
                                    label="Drop-off Location"
                                    value={formData.dropoffAddress}
                                    onChange={(address, lat, lng) => setFormData(prev => ({
                                        ...prev,
                                        dropoffAddress: address,
                                        dropoffLat: lat,
                                        dropoffLng: lng,
                                    }))}
                                    placeholder="Enter destination..."
                                    required
                                />
                                {errors.dropoffAddress && (
                                    <p className="text-sm text-red-500 mt-1">{errors.dropoffAddress}</p>
                                )}
                            </div>
                        )}

                        {/* Hours (if hourly) */}
                        {formData.tripType === TRIP_TYPES.HOURLY && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Hours (minimum 2)
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, hours: Math.max(2, prev.hours - 1) }))}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition"
                                    >
                                        −
                                    </button>
                                    <span className="text-2xl font-semibold w-12 text-center">{formData.hours}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, hours: prev.hours + 1 }))}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <Input
                                label="Pickup Date"
                                type="date"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleInputChange}
                                error={errors.scheduledDate}
                                required
                            />
                            <Input
                                label="Pickup Time"
                                type="time"
                                name="scheduledTime"
                                value={formData.scheduledTime}
                                onChange={handleInputChange}
                                error={errors.scheduledTime}
                                required
                            />
                        </div>

                        {/* Passengers & Luggage */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Passengers
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => decrementValue('passengers')}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition"
                                    >
                                        −
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center">{formData.passengers}</span>
                                    <button
                                        type="button"
                                        onClick={() => incrementValue('passengers')}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Luggage
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => decrementValue('luggage')}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition"
                                    >
                                        −
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center">{formData.luggage}</span>
                                    <button
                                        type="button"
                                        onClick={() => incrementValue('luggage')}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Airport Ride */}
                        <div className="mb-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isAirportRide"
                                    checked={formData.isAirportRide}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="font-medium text-gray-700">This is an airport pickup or drop-off</span>
                            </label>
                        </div>

                        {/* Flight Info (if airport) */}
                        {formData.isAirportRide && (
                            <div className="space-y-4 p-4 bg-primary-50 rounded-lg mb-6">
                                <Input
                                    label="Flight Number"
                                    name="flightNumber"
                                    value={formData.flightNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g., AA1234"
                                    error={errors.flightNumber}
                                />
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="meetAndGreet"
                                        checked={formData.meetAndGreet}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Add Meet & Greet Service (+$20)
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Special Items */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Special Requirements (Optional)
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={formData.specialItems.carSeat}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            specialItems: { ...prev.specialItems, carSeat: e.target.checked }
                                        }))}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-700">Car Seat / Booster</span>
                                        <p className="text-xs text-gray-500">Required for children under 8</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={formData.specialItems.wheelchair}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            specialItems: { ...prev.specialItems, wheelchair: e.target.checked }
                                        }))}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-700">Wheelchair Accessible</span>
                                        <p className="text-xs text-gray-500">Vehicle with wheelchair ramp</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={formData.specialItems.pets}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            specialItems: { ...prev.specialItems, pets: e.target.checked }
                                        }))}
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-700">Traveling with Pets</span>
                                        <p className="text-xs text-gray-500">Pet-friendly vehicle (small pets only)</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                            <Button type="button" variant="ghost" onClick={() => router.push('/')}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="lg">
                                Continue to Vehicle Selection →
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading booking form...</div>}>
            <BookingPageContent />
        </Suspense>
    );
}
