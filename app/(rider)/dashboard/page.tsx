'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        fetchBookings(token);
    }, [router]);

    const fetchBookings = async (token: string) => {
        try {
            const response = await api('/api/bookings/my-rides', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    const upcomingRides = bookings.filter(b =>
        ['paid_pending_confirmation', 'confirmed', 'driver_assigned', 'en_route', 'arrived'].includes(b.status)
    );

    const pastRides = bookings.filter(b =>
        ['completed', 'cancelled_by_rider', 'cancelled_by_admin', 'no_show'].includes(b.status)
    );

    return (
        <main className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.firstName}!
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your rides and account settings</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card variant="elevated" padding="md">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-primary-600">{upcomingRides.length}</p>
                            <p className="text-gray-600 mt-2">Upcoming Rides</p>
                        </div>
                    </Card>
                    <Card variant="elevated" padding="md">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-success-600">{pastRides.filter(b => b.status === 'completed').length}</p>
                            <p className="text-gray-600 mt-2">Completed Rides</p>
                        </div>
                    </Card>
                    <Card variant="elevated" padding="md">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900">{bookings.length}</p>
                            <p className="text-gray-600 mt-2">Total Rides</p>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link href="/booking">
                        <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                            <div className="text-center">
                                <div className="text-4xl mb-3">🚗</div>
                                <h3 className="font-semibold text-gray-900">Book a Ride</h3>
                            </div>
                        </Card>
                    </Link>
                    <Link href="/dashboard/my-rides">
                        <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                            <div className="text-center">
                                <div className="text-4xl mb-3">📋</div>
                                <h3 className="font-semibold text-gray-900">My Rides</h3>
                            </div>
                        </Card>
                    </Link>
                    <Link href="/receipts">
                        <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                            <div className="text-center">
                                <div className="text-4xl mb-3">💳</div>
                                <h3 className="font-semibold text-gray-900">Receipts</h3>
                            </div>
                        </Card>
                    </Link>
                    <Link href="/dashboard/profile">
                        <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                            <div className="text-center">
                                <div className="text-4xl mb-3">⚙️</div>
                                <h3 className="font-semibold text-gray-900">Settings</h3>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Recent Rides */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Rides</h2>
                        <Link href="/dashboard/my-rides" className="text-primary-600 hover:text-primary-700 font-medium">
                            View All →
                        </Link>
                    </div>

                    {bookings.length === 0 ? (
                        <Card padding="lg">
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">You haven't booked any rides yet</p>
                                <Link href="/booking">
                                    <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                                        Book Your First Ride
                                    </button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {bookings.slice(0, 3).map((booking) => (
                                <Card key={booking._id} variant="bordered" padding="md">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">{booking.pickup.address}</h3>
                                                <span className="text-gray-400 hidden sm:inline">→</span>
                                                <span className="text-gray-700">{booking.dropoff?.address}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <span>📅 {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                                                <span>🕐 {booking.scheduledTime}</span>
                                                <span>💰 ${booking.totalPrice?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:items-end gap-2">
                                            <StatusBadge status={booking.status} />
                                            {booking.quoteStatus === 'quoted' && booking.paymentStatus !== 'paid' && (
                                                <a
                                                    href={booking.stripePaymentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full hover:bg-primary-700 transition shadow-sm animate-pulse"
                                                >
                                                    Pay ${booking.quotedPrice?.toFixed(2)}
                                                </a>
                                            )}
                                            {booking.paymentStatus === 'paid' && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                                    PAID ${booking.totalPrice?.toFixed(2)}
                                                </span>
                                            )}
                                            {booking.quoteStatus === 'pending' && booking.status !== 'cancelled' && (
                                                <span className="text-xs text-gray-500 italic">Quote Pending...</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleLogout}
                        className="text-danger-600 hover:text-danger-700 font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </main>
    );
}
