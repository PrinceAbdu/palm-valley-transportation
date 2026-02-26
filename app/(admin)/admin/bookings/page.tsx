'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

export default function AdminBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quotingBookingId, setQuotingBookingId] = useState<string | null>(null);
    const [quotedPrice, setQuotedPrice] = useState('');
    const [quoteNotes, setQuoteNotes] = useState('');
    const [paymentLink, setPaymentLink] = useState('');
    const [sendingQuote, setSendingQuote] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchData(token);
        }
    }, []);

    const fetchData = async (token: string) => {
        try {
            const [bookingsRes, driversRes] = await Promise.all([
                api('/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
                api('/api/admin/drivers', { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const bookingsData = await bookingsRes.json();
            const driversData = await driversRes.json();

            if (bookingsData.success) setBookings(bookingsData.data);
            if (driversData.success) setDrivers(driversData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const assignDriver = async (bookingId: string, driverId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await api(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ driverId }),
            });
            const data = await res.json();
            if (data.success) {
                fetchData(token!);
            }
        } catch (error) {
            console.error('Error assigning driver:', error);
        }
    };

    const sendQuote = async (bookingId: string) => {
        if (!quotedPrice || parseFloat(quotedPrice) <= 0) {
            alert('Please enter a valid price');
            return;
        }

        setSendingQuote(true);
        try {
            const token = localStorage.getItem('token');
            const res = await api('/api/admin/bookings/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookingId,
                    quotedPrice: parseFloat(quotedPrice),
                    stripePaymentUrl: paymentLink.trim() || undefined,
                    notes: quoteNotes,
                }),
            });

            const data = await res.json();
            if (data.success) {
                if (data.data?.emailAddressFound && data.data?.emailSent) {
                    alert('Quote sent successfully! Email delivered.');
                } else if (data.data?.emailAddressFound && !data.data?.emailSent) {
                    alert('Quote saved, but email could not be delivered. Please check SMTP settings.');
                } else {
                    alert('Quote saved. No email address on file.');
                }
                setQuotingBookingId(null);
                setQuotedPrice('');
                setQuoteNotes('');
                setPaymentLink('');
                fetchData(token!);
            } else {
                alert(data.error || 'Failed to send quote');
            }
        } catch (error) {
            alert('Failed to send quote. Please try again.');
        } finally {
            setSendingQuote(false);
        }
    };

    const getCustomerInfo = (booking: any) => {
        if (booking.riderId) {
            return {
                name: `${booking.riderId.firstName} ${booking.riderId.lastName}`,
                email: booking.riderId.email,
                phone: booking.riderId.phone,
                type: 'Registered',
            };
        }
        return {
            name: booking.guestName || 'N/A',
            email: booking.guestEmail || 'N/A',
            phone: booking.guestPhone || 'N/A',
            type: 'Guest',
        };
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
                <p className="text-gray-600 mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
            </div>

            {bookings.length === 0 ? (
                <Card variant="elevated" padding="lg" className="text-center">
                    <p className="text-gray-500">No bookings found.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const customer = getCustomerInfo(booking);
                        return (
                            <Card key={booking._id} variant="elevated" padding="md">
                                <div className="grid md:grid-cols-4 gap-4 items-start">
                                    {/* Booking Info */}
                                    <div>
                                        <p className="font-bold text-gray-900">{booking.bookingNumber}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(booking.scheduledDate).toLocaleDateString()} · {booking.scheduledTime}
                                        </p>
                                        <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                        </span>
                                    </div>

                                    {/* Customer Info */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                                        <p className="text-sm text-gray-500">{customer.email}</p>
                                        <p className="text-sm text-gray-500">{customer.phone}</p>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${customer.type === 'Guest' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {customer.type}
                                        </span>
                                    </div>

                                    {/* Trip Details */}
                                    <div>
                                        <p className="text-sm text-gray-900">
                                            <span className="font-medium">From:</span> {booking.pickup?.address?.substring(0, 40)}...
                                        </p>
                                        {booking.dropoff?.address && (
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">To:</span> {booking.dropoff.address.substring(0, 40)}...
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">
                                            {booking.vehicleId?.name || 'Vehicle'} · {booking.passengers} pax
                                        </p>
                                    </div>

                                    {/* Pricing & Actions */}
                                    <div>
                                        {booking.quoteStatus === 'quoted' ? (
                                            <div>
                                                <p className="text-xl font-bold text-green-600">${booking.quotedPrice?.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">Quote sent</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Awaiting Payment'}
                                                </span>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => setQuotingBookingId(booking._id)}
                                            >
                                                💰 Quote Price
                                            </Button>
                                        )}

                                        {/* Driver Assignment */}
                                        <div className="mt-3">
                                            {booking.driverId ? (
                                                <p className="text-sm text-gray-600">
                                                    🚗 {(booking.driverId as any).firstName} {(booking.driverId as any).lastName}
                                                </p>
                                            ) : (
                                                <select
                                                    className="text-xs border rounded-lg px-2 py-1 w-full"
                                                    onChange={(e) => e.target.value && assignDriver(booking._id, e.target.value)}
                                                    defaultValue=""
                                                >
                                                    <option value="">Assign driver...</option>
                                                    {drivers.filter((d: any) => d.status === 'active').map((driver: any) => (
                                                        <option key={driver._id} value={driver._id}>
                                                            {driver.firstName} {driver.lastName}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Form */}
                                {quotingBookingId === booking._id && (
                                    <div className="mt-4 pt-4 border-t bg-blue-50 rounded-lg p-4">
                                        <h4 className="font-bold text-gray-900 mb-3">Send Price Quote</h4>
                                        <div className="grid md:grid-cols-4 gap-3 items-end">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={quotedPrice}
                                                    onChange={(e) => setQuotedPrice(e.target.value)}
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                                                <input
                                                    type="text"
                                                    value={quoteNotes}
                                                    onChange={(e) => setQuoteNotes(e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="Any notes for the customer..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Link (optional)</label>
                                                <input
                                                    type="url"
                                                    value={paymentLink}
                                                    onChange={(e) => setPaymentLink(e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => sendQuote(booking._id)}
                                                    disabled={sendingQuote}
                                                    size="sm"
                                                >
                                                    {sendingQuote ? 'Sending...' : '📧 Send Quote'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setQuotingBookingId(null);
                                                        setQuotedPrice('');
                                                        setQuoteNotes('');
                                                        setPaymentLink('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Quote details will be sent to: {customer.email}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
