'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface PriceEstimateDisplayProps {
    tripType: 'one_way' | 'round_trip' | 'hourly';
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
    hours?: number;
    isAirportRide?: boolean;
    meetAndGreet?: boolean;
    onPriceCalculated?: (price: number) => void;
}

export default function PriceEstimateDisplay({
    tripType,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    hours,
    isAirportRide,
    meetAndGreet,
    onPriceCalculated,
}: PriceEstimateDisplayProps) {
    const [estimate, setEstimate] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEstimate = async () => {
            // For hourly, we need hours
            if (tripType === 'hourly' && hours && hours >= 2) {
                setLoading(true);
                try {
                    const response = await api('/api/bookings/estimate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tripType,
                            hours,
                            isAirportRide,
                            meetAndGreet,
                        }),
                    });

                    const data = await response.json();
                    if (data.success) {
                        setEstimate(data.data.total);
                        onPriceCalculated?.(data.data.total);
                    }
                } catch (err) {
                    setError('Failed to calculate estimate');
                } finally {
                    setLoading(false);
                }
                return;
            }

            // For one-way and round-trip, we need coordinates
            if ((tripType === 'one_way' || tripType === 'round_trip') &&
                pickupLat && pickupLng && dropoffLat && dropoffLng) {
                setLoading(true);
                try {
                    const response = await api('/api/bookings/estimate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tripType,
                            pickupLat,
                            pickupLng,
                            dropoffLat,
                            dropoffLng,
                            isAirportRide,
                            meetAndGreet,
                        }),
                    });

                    const data = await response.json();
                    if (data.success) {
                        setEstimate(data.data.total);
                        onPriceCalculated?.(data.data.total);
                    }
                } catch (err) {
                    setError('Failed to calculate estimate');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchEstimate();
    }, [tripType, pickupLat, pickupLng, dropoffLat, dropoffLng, hours, isAirportRide, meetAndGreet, onPriceCalculated]);

    if (!estimate && !loading) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-6 border border-primary-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Estimated Price</p>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-500">Calculating...</span>
                        </div>
                    ) : error ? (
                        <p className="text-red-500 text-sm">{error}</p>
                    ) : (
                        <p className="text-3xl font-bold text-primary-600">
                            ${estimate?.toFixed(2)}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                (before vehicle selection)
                            </span>
                        </p>
                    )}
                </div>
                <div className="text-4xl">💰</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Final price depends on vehicle selection. Additional fees may apply.
            </p>
        </div>
    );
}
