'use client';

import { useState, useRef, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const libraries: ('places')[] = ['places'];

interface MapPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (address: string, lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const defaultCenter = {
    lat: 30.3322,
    lng: -81.6557, // Jacksonville, FL
};

export default function MapPickerModal({
    isOpen,
    onClose,
    onSelect,
    initialLat,
    initialLng,
}: MapPickerModalProps) {
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const mapRef = useRef<google.maps.Map | null>(null);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarker({ lat, lng });
        setLoading(true);

        try {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: { lat, lng } });
            if (result.results[0]) {
                setAddress(result.results[0].formatted_address);
            }
        } catch (err) {
            setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleConfirm = () => {
        if (marker && address) {
            onSelect(address, marker.lat, marker.lng);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">📍 Choose Location on Map</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                <div className="p-4">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            zoom={12}
                            center={marker || (initialLat && initialLng ? { lat: initialLat, lng: initialLng } : defaultCenter)}
                            onClick={onMapClick}
                            onLoad={onMapLoad}
                            options={{
                                streetViewControl: false,
                                mapTypeControl: false,
                            }}
                        >
                            {marker && <Marker position={marker} />}
                        </GoogleMap>
                    ) : (
                        <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
                            <p className="text-gray-500">Loading map...</p>
                        </div>
                    )}

                    {/* Selected Address */}
                    {marker && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Selected Location:</p>
                            <p className="font-medium text-gray-900">
                                {loading ? 'Getting address...' : address}
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        Click anywhere on the map to select a location
                    </p>
                </div>

                <div className="flex gap-3 p-4 border-t">
                    <button
                        onClick={handleConfirm}
                        disabled={!marker || loading}
                        className="flex-1 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Location
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
