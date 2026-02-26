'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';

interface ReportData {
    summary: {
        totalBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        noShows: number;
        totalRevenue: number;
        avgOrderValue: number;
        completionRate: number;
        cancellationRate: number;
        noShowRate: number;
    };
    breakdowns: {
        byStatus: Array<{ _id: string; count: number }>;
        byTripType: Array<{ _id: string; count: number }>;
    };
    trends: {
        daily: Array<{ _id: string; count: number; revenue: number }>;
    };
    period: {
        days: number;
        startDate: string;
        endDate: string;
    };
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        fetchReports();
    }, [period]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api(`/api/admin/reports?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8">
                <p className="text-gray-600">Failed to load reports</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-2">Platform performance overview</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last Year</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card variant="elevated" padding="lg">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                        <p className="text-3xl font-bold text-primary-600">{data.summary.totalBookings}</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="lg">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Revenue</p>
                        <p className="text-3xl font-bold text-green-600">
                            ${data.summary.totalRevenue.toLocaleString()}
                        </p>
                    </div>
                </Card>
                <Card variant="elevated" padding="lg">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                        <p className="text-3xl font-bold text-blue-600">{data.summary.completionRate}%</p>
                    </div>
                </Card>
                <Card variant="elevated" padding="lg">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                        <p className="text-3xl font-bold text-purple-600">
                            ${data.summary.avgOrderValue.toFixed(2)}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <Card variant="elevated" padding="lg">
                    <h3 className="text-xl font-bold mb-4">Booking Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Completed</span>
                            <span className="font-medium text-green-600">{data.summary.completedBookings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Cancelled</span>
                            <span className="font-medium text-red-600">{data.summary.cancelledBookings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">No-Shows</span>
                            <span className="font-medium text-yellow-600">{data.summary.noShows}</span>
                        </div>
                    </div>
                </Card>
                   <Card variant="elevated" padding="lg">
                    <h3 className="text-xl font-bold mb-4">By Trip Type</h3>
                    <div className="space-y-2">
                        {data.breakdowns.byTripType.map((item) => (
                            <div key={item._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="capitalize">{item._id?.replace('_', ' ') || 'Unknown'}</span>
                                <span className="font-medium">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* <Card variant="elevated" padding="lg">
                    <h3 className="text-xl font-bold mb-4">Performance Rates</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Completion Rate</span>
                                <span>{data.summary.completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${data.summary.completionRate}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Cancellation Rate</span>
                                <span>{data.summary.cancellationRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-red-600 h-2 rounded-full"
                                    style={{ width: `${data.summary.cancellationRate}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>No-Show Rate</span>
                                <span>{data.summary.noShowRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-600 h-2 rounded-full"
                                    style={{ width: `${data.summary.noShowRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </Card> */}
            </div>

            {/* Breakdowns */}
            <div className="grid lg:grid-cols-2 gap-6">
             

                {/* <Card variant="elevated" padding="lg">
                    <h3 className="text-xl font-bold mb-4">By Status</h3>
                    <div className="space-y-2">
                        {data.breakdowns.byStatus.map((item) => (
                            <div key={item._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="capitalize">{item._id?.replace('_', ' ') || 'Unknown'}</span>
                                <span className="font-medium">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </Card> */}
            </div>
        </div>
    );
}
