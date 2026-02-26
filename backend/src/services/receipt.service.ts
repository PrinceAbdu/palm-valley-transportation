// PDF receipt generation service
// Note: jspdf is typically a browser library. For Node.js,
// we'll make this a stub that returns receipt data as JSON.
// If full PDF generation is needed, consider using pdfkit instead.

interface ReceiptData {
    bookingNumber: string;
    bookingDate: string;
    tripDate: string;
    riderName: string;
    riderEmail: string;
    riderPhone: string;
    pickupAddress: string;
    dropoffAddress?: string;
    vehicleName: string;
    tripType: string;
    passengers: number;
    luggage: number;
    basePrice: number;
    fees: {
        airportFee: number;
        meetGreetFee: number;
    };
    totalPrice: number;
    paymentMethod: string;
    status: string;
}

export function generateReceiptData(data: ReceiptData): ReceiptData {
    return data;
}

// For backwards compatibility, return a buffer-like object
export function generateReceipt(data: ReceiptData): { output: (type: string) => ArrayBuffer } {
    // Create a simple text-based receipt as a buffer
    const receiptText = `
PALM VALLEY TRANSPORTATION
===========================
Receipt

Booking #: ${data.bookingNumber}
Date: ${data.bookingDate}
Trip Date: ${data.tripDate}

Rider: ${data.riderName}
Email: ${data.riderEmail}
Phone: ${data.riderPhone}

Pickup: ${data.pickupAddress}
${data.dropoffAddress ? `Dropoff: ${data.dropoffAddress}` : ''}

Vehicle: ${data.vehicleName}
Trip Type: ${data.tripType}
Passengers: ${data.passengers}
Luggage: ${data.luggage}

Base Price: $${data.basePrice.toFixed(2)}
Airport Fee: $${data.fees.airportFee.toFixed(2)}
Meet & Greet Fee: $${data.fees.meetGreetFee.toFixed(2)}
----------------------------
Total: $${data.totalPrice.toFixed(2)}

Payment: ${data.paymentMethod}
Status: ${data.status}

Thank you for choosing Palm Valley Transportation!
`;

    const encoder = new TextEncoder();
    const buffer = encoder.encode(receiptText).buffer;

    return {
        output: (_type: string) => buffer,
    };
}
