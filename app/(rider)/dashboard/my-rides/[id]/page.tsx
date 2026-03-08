'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export default function RideDetailsPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const fromNotification = searchParams.get('fromNotification') === '1';

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchBooking(token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.id]);

    const fetchBooking = async (token: string) => {
        try {
            const response = await api(`/api/bookings/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.success) {
                setBooking(data.data);
            } else {
                alert(data.error || 'Booking not found');
                router.push('/dashboard/my-rides');
            }
        } catch (error) {
            console.error('Failed to fetch booking details:', error);
            router.push('/dashboard/my-rides');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="py-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[320px] flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </main>
        );
    }

    if (!booking) return null;

    return (
        <main className="py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {fromNotification && booking.status === 'confirmed' && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <p className="text-green-700 font-semibold">Thank you for your booking.</p>
                        <p className="text-green-600 text-sm mt-1">
                            Your booking has been confirmed. We appreciate your trust in Palm Valley Transportation.
                        </p>
                    </div>
                )}

                <Card padding="lg" variant="elevated">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                            <p className="text-gray-600 mt-1">#{booking.bookingNumber}</p>
                        </div>
                        <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-500">Pickup</p>
                                <p className="text-gray-900 font-medium">{booking.pickup?.address || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Drop-off</p>
                                <p className="text-gray-900 font-medium">{booking.dropoff?.address || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Trip Type</p>
                                <p className="text-gray-900 font-medium">{String(booking.tripType || '').replace('_', ' ') || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-gray-500">Date & Time</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Passengers / Luggage</p>
                                <p className="text-gray-900 font-medium">{booking.passengers} / {booking.luggage || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Price</p>
                                <p className="text-gray-900 font-medium">
                                    {typeof booking.quotedPrice === 'number'
                                        ? `$${booking.quotedPrice.toFixed(2)} (Quoted)`
                                        : typeof booking.totalPrice === 'number'
                                            ? `$${booking.totalPrice.toFixed(2)}`
                                            : 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-5 mt-5 border-t flex gap-3">
                        <Button variant="outline" onClick={() => router.push('/notifications')}>
                            Back to Notifications
                        </Button>
                        <Button variant="secondary" onClick={() => router.push('/dashboard/my-rides')}>
                            Back to My Rides
                        </Button>
                    </div>
                </Card>
            </div>
        </main>
    );
}
