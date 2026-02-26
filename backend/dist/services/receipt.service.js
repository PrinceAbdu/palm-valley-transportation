"use strict";
// PDF receipt generation service
// Note: jspdf is typically a browser library. For Node.js,
// we'll make this a stub that returns receipt data as JSON.
// If full PDF generation is needed, consider using pdfkit instead.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReceiptData = generateReceiptData;
exports.generateReceipt = generateReceipt;
function generateReceiptData(data) {
    return data;
}
// For backwards compatibility, return a buffer-like object
function generateReceipt(data) {
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
        output: (_type) => buffer,
    };
}
