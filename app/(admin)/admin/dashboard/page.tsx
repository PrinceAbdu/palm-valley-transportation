'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchAnalytics(token);
    }, [router]);

    const fetchAnalytics = async (token: string) => {
        try {
            const response = await api('/api/admin/analytics', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-primary-600">
                            {analytics?.counts?.users || 0}
                        </p>
                        <p className="text-gray-600 mt-2">Total Users</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-secondary-600">
                            {analytics?.counts?.drivers || 0}
                        </p>
                        <p className="text-gray-600 mt-2">Drivers</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-success-600">
                            {analytics?.counts?.bookings || 0}
                        </p>
                        <p className="text-gray-600 mt-2">Total Bookings</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="md">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900">
                            {analytics?.counts?.vehicles || 0}
                        </p>
                        <p className="text-gray-600 mt-2">Vehicles</p>
                    </div>
                </Card>
            </div>

            {/* Revenue Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card variant="elevated" padding="lg">
                    <h3 className="text-lg font-bold mb-4">Revenue</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-3xl font-bold text-success-600">
                                ${analytics?.revenue?.total?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-primary-600">
                                ${analytics?.revenue?.thisMonth?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" padding="lg">
                    <h3 className="text-lg font-bold mb-4">Bookings</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {analytics?.bookings?.total || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-primary-600">
                                {analytics?.bookings?.thisMonth || 0}
                            </p>
                        </div>
                    </div>
                </Card>
            </div> */}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Link href="/admin/vehicles">
                    <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🚗</div>
                            <h3 className="font-semibold text-gray-900">Vehicles</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage fleet</p>
                        </div>
                    </Card>
                </Link>
                <Link href="/admin/drivers">
                    <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                        <div className="text-center">
                            <div className="text-4xl mb-3">👨‍✈️</div>
                            <h3 className="font-semibold text-gray-900">Drivers</h3>
                            <p className="text-sm text-gray-600 mt-1">Manage drivers</p>
                        </div>
                    </Card>
                </Link>
                <Link href="/admin/bookings">
                    <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                        <div className="text-center">
                            <div className="text-4xl mb-3">📋</div>
                            <h3 className="font-semibold text-gray-900">Bookings</h3>
                            <p className="text-sm text-gray-600 mt-1">All bookings</p>
                        </div>
                    </Card>
                </Link>
                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition cursor-pointer" padding="md">
                        <div className="text-center">
                            <div className="text-4xl mb-3">👥</div>
                            <h3 className="font-semibold text-gray-900">Users</h3>
                            <p className="text-sm text-gray-600 mt-1">User management</p>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Recent Bookings */}
            <Card padding="lg">
                <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                    {analytics?.recent && analytics.recent.length > 0 ? (
                        analytics.recent.slice(0, 5).map((booking: any) => (
                            <div key={booking._id} className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b last:border-b-0 gap-2">
                                <div>
                                    <p className="font-medium">
                                        {booking.riderId?.firstName || booking.guestName || 'Guest'} {booking.riderId?.lastName || ''}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {booking.pickup?.address}
                                    </p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="font-bold text-success-600">
                                        ${booking.quotedPrice?.toFixed(2) || booking.totalPrice?.toFixed(2) || '—'}
                                    </p>
                                    <p className="text-xs text-gray-500">{booking.status}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 text-center py-4">No bookings yet</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
