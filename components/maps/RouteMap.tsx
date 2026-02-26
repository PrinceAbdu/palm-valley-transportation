'use client';

import { useEffect, useRef, useState } from 'react';

interface RouteMapProps {
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
    className?: string;
}

export default function RouteMap({
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    className = '',
}: RouteMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [distance, setDistance] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Check if Google Maps is loaded
    useEffect(() => {
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
                return true;
            }
            return false;
        };

        if (checkGoogleMaps()) return;

        const interval = setInterval(() => {
            if (checkGoogleMaps()) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!isLoaded || !mapRef.current || map) return;

        const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 30.3322, lng: -81.6557 }, // Jacksonville center
            zoom: 11,
            disableDefaultUI: true,
            zoomControl: true,
        });

        const renderer = new google.maps.DirectionsRenderer({
            map: newMap,
            suppressMarkers: false,
        });

        setMap(newMap);
        setDirectionsRenderer(renderer);
    }, [isLoaded, map]);

    // Draw route when coordinates change
    useEffect(() => {
        if (!map || !directionsRenderer) return;
        if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) return;

        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: { lat: pickupLat, lng: pickupLng },
                destination: { lat: dropoffLat, lng: dropoffLng },
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    directionsRenderer.setDirections(result);

                    const route = result.routes[0];
                    if (route && route.legs[0]) {
                        setDistance(route.legs[0].distance?.text || null);
                        setDuration(route.legs[0].duration?.text || null);
                    }
                }
            }
        );
    }, [map, directionsRenderer, pickupLat, pickupLng, dropoffLat, dropoffLng]);

    // Don't render if no coordinates
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
        return null;
    }

    // Fallback if Google Maps not available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
                <p className="text-gray-600 text-center">
                    📍 Map preview requires Google Maps API key
                </p>
            </div>
        );
    }

    return (
        <div className={`rounded-lg overflow-hidden ${className}`}>
            <div ref={mapRef} className="w-full h-64" />
            {(distance || duration) && (
                <div className="bg-white p-3 border-t flex justify-center gap-6 text-sm">
                    {distance && (
                        <div className="flex items-center gap-2">
                            <span className="text-primary-500">📏</span>
                            <span className="font-medium">{distance}</span>
                        </div>
                    )}
                    {duration && (
                        <div className="flex items-center gap-2">
                            <span className="text-primary-500">⏱️</span>
                            <span className="font-medium">{duration}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
