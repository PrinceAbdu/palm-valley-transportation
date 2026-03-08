'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

export default function MyRidesPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchBookings(token);
    }, [router]);

    const fetchBookings = async (token: string) => {
        try {
            const response = await api('/api/bookings/my-rides', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this ride?')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await api(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                alert(data.data.message);
                // Refresh bookings
                fetchBookings(token!);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to cancel booking');
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'upcoming') {
            return ['paid_pending_confirmation', 'confirmed', 'driver_assigned', 'en_route', 'arrived'].includes(b.status);
        } else if (filter === 'past') {
            return ['completed', 'cancelled_by_rider', 'cancelled_by_admin', 'no_show'].includes(b.status);
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <main className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">My Rides</h1>

                {/* Filter Tabs */}
                <div className="flex gap-4 mb-6">
                    {(['all', 'upcoming', 'past'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === tab
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <Card padding="lg">
                        <div className="text-center py-12">
                            <p className="text-gray-600">No rides found</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <Card key={booking._id} variant="bordered" padding="lg">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Booking #{booking.bookingNumber}
                                            </h3>
                                            <StatusBadge status={booking.status} />
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <span className="font-medium">From:</span>
                                                <span>{booking.pickup.address}</span>
                                            </div>
                                            {booking.dropoff && (
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <span className="font-medium">To:</span>
                                                    <span>{booking.dropoff.address}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-6 text-gray-600">
                                                <span>📅 {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                                                <span>🕐 {booking.scheduledTime}</span>
                                                <span>👥 {booking.passengers} passengers</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        {booking.quoteStatus === 'quoted' ? (
                                            <>
                                                <p className="text-2xl font-bold text-primary-600">
                                                    ${booking.quotedPrice?.toFixed(2)}
                                                </p>
                                                {booking.paymentStatus !== 'paid' ? (
                                                    <a
                                                        href={booking.stripePaymentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-1.5 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition shadow-sm animate-pulse mt-1 inline-block"
                                                    >
                                                        Pay Now
                                                    </a>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                                        PAID
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">
                                                {booking.status === 'cancelled' ? 'Cancelled' : 'Quote Pending'}
                                            </p>
                                        )}

                                        {booking.vehicleId && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {booking.vehicleId.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/my-rides/${booking._id}`)}>
                                        View Details
                                    </Button>
                                    {['paid_pending_confirmation', 'confirmed', 'driver_assigned'].includes(booking.status) && (
                                        <Button variant="danger" size="sm" onClick={() => handleCancel(booking._id)}>
                                            Cancel Ride
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
