'use client';

import { useState } from 'react';

interface UseMyLocationProps {
    onLocationFound: (address: string, lat: number, lng: number) => void;
    onError?: (error: string) => void;
}

export default function UseMyLocationButton({ onLocationFound, onError }: UseMyLocationProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (!navigator.geolocation) {
            onError?.('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse geocode to get address
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                    );

                    const data = await response.json();

                    if (data.results && data.results[0]) {
                        onLocationFound(data.results[0].formatted_address, latitude, longitude);
                    } else {
                        // Fallback: use coordinates as address
                        onLocationFound(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, latitude, longitude);
                    }
                } catch (error) {
                    // Fallback: use coordinates
                    onLocationFound(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, latitude, longitude);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        onError?.('Location permission denied. Please enable location access.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        onError?.('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        onError?.('The request to get your location timed out.');
                        break;
                    default:
                        onError?.('An unknown error occurred.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition font-medium"
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></span>
                    Getting location...
                </>
            ) : (
                <>
                    <span className="text-lg">📍</span>
                    Use my current location
                </>
            )}
        </button>
    );
}
