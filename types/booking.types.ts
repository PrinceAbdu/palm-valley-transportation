export interface BookingFormData {
    tripType: 'one_way' | 'round_trip' | 'hourly';
    pickup: {
        address: string;
        lat: number;
        lng: number;
        notes?: string;
    };
    dropoff?: {
        address: string;
        lat: number;
        lng: number;
    };
    scheduledDate: Date;
    scheduledTime: string;
    passengers: number;
    luggage: number;
    isAirportRide: boolean;
    flightNumber?: string;
    meetAndGreet?: boolean;
    hours?: number;
}

export interface VehicleType {
    _id: string;
    name: string;
    description: string;
    type: string;
    maxPassengers: number;
    maxLuggage: number;
    basePrice: number;
    priceMultiplier: number;
    imageUrl?: string;
    features: string[];
    isActive: boolean;
}

export interface PriceEstimate {
    basePrice: number;
    distancePrice: number;
    timePrice: number;
    fees: {
        airportFee: number;
        meetGreetFee: number;
    };
    subtotal: number;
    tax: number;
    total: number;
}
