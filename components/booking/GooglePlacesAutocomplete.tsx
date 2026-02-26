'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface GooglePlacesAutocompleteProps {
    value: string;
    onChange: (value: string, placeDetails?: PlaceDetails) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
}

interface PlaceDetails {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
}

export default function GooglePlacesAutocomplete({
    value,
    onChange,
    placeholder = 'Enter address...',
    label,
    error,
    required,
}: GooglePlacesAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Check if Google Maps is loaded
    useEffect(() => {
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsLoaded(true);
                return true;
            }
            return false;
        };

        if (checkGoogleMaps()) return;

        // Wait for Google Maps to load
        const interval = setInterval(() => {
            if (checkGoogleMaps()) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Initialize autocomplete
    useEffect(() => {
        if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'geometry', 'place_id'],
            types: ['address'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();

            if (place && place.formatted_address && place.geometry?.location) {
                const placeDetails: PlaceDetails = {
                    address: place.formatted_address,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    placeId: place.place_id || '',
                };

                onChange(place.formatted_address, placeDetails);
            }
        });
    }, [isLoaded, onChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
                />
                {!isLoaded && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
            {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                <p className="mt-1 text-xs text-yellow-600">
                    Note: Google Maps API key not configured. Using basic text input.
                </p>
            )}
        </div>
    );
}

// Type declaration for Google Maps
declare global {
    interface Window {
        google: typeof google;
    }
}
