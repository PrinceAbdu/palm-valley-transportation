'use client';

import { useState, useRef, useEffect } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import MapPickerModal from './MapPickerModal';

const libraries: ('places')[] = ['places'];

interface LocationPickerProps {
    label: string;
    value: string;
    onChange: (address: string, lat: number, lng: number) => void;
    placeholder?: string;
    required?: boolean;
}

export default function LocationPicker({
    label,
    value,
    onChange,
    placeholder = 'Enter an address...',
    required = false,
}: LocationPickerProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [showMap, setShowMap] = useState(false);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    // Reverse geocode coordinates to get place name
    const reverseGeocodeCoordinates = async (lat: number, lng: number, originalAddress: string) => {
        // If address looks like coordinates (format: "lat, lng"), try to geocode it
        const coordPattern = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
        if (coordPattern.test(originalAddress)) {
            try {
                const geocoder = new google.maps.Geocoder();
                const result = await geocoder.geocode({ location: { lat, lng } });
                if (result.results?.[0]) {
                    const friendlyAddress = result.results[0].formatted_address;
                    setDisplayValue(friendlyAddress);
                    return friendlyAddress;
                }
            } catch (err) {
                console.error('Reverse geocoding failed:', err);
            }
        }
        setDisplayValue(originalAddress);
        return originalAddress;
    };

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || place.name || '';
            setDisplayValue(address);
            onChange(address, lat, lng);
        }
    };

    const handleMapSelect = async (address: string, lat: number, lng: number) => {
        // Reverse geocode if address is in coordinate format
        const finalAddress = await reverseGeocodeCoordinates(lat, lng, address);
        onChange(finalAddress, lat, lng);
        setShowMap(false);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex gap-2">
                {isLoaded ? (
                    <Autocomplete
                        onLoad={onAutocompleteLoad}
                        onPlaceChanged={onPlaceChanged}
                        options={{
                            componentRestrictions: { country: 'us' },
                            types: ['geocode', 'establishment'],
                        }}
                        className="flex-1"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={displayValue}
                            onChange={(e) => {
                                setDisplayValue(e.target.value);
                                onChange(e.target.value, 0, 0);
                            }}
                            placeholder={placeholder}
                            required={required}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        />
                    </Autocomplete>
                ) : (
                    <input
                        type="text"
                        value={displayValue}
                        onChange={(e) => {
                            setDisplayValue(e.target.value);
                            onChange(e.target.value, 0, 0);
                        }}
                        placeholder={placeholder}
                        required={required}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    />
                )}
                <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm whitespace-nowrap"
                    title="Choose on map"
                >
                    🗺️ Map
                </button>
            </div>

            <MapPickerModal
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                onSelect={handleMapSelect}
            />
        </div>
    );
}
