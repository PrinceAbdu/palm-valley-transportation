'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Receipt {
    _id: string;
    bookingNumber: string;
    scheduledDate: string;
    pickup: { address: string };
    dropoff?: { address: string };
    totalPrice: number;
    status: string;
}

export default function ReceiptsPage() {
    const router = useRouter();
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchReceipts(token);
    }, [router]);

    const fetchReceipts = async (token: string) => {
        try {
            const response = await api('/api/bookings/my-rides', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                // Only show completed rides
                setReceipts(data.data.filter((b: Receipt) => b.status === 'completed'));
            }
        } catch (error) {
            console.error('Error fetching receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReceipt = async (bookingId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api(`/api/bookings/${bookingId}/receipt`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-${bookingId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                alert('Failed to download receipt');
            }
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Error downloading receipt');
        }
    };

    const totalSpent = receipts.reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <main className="py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
                    <p className="text-gray-600 mt-1">Download receipts for your completed rides</p>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card variant="elevated" padding="md">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-primary-600">{receipts.length}</p>
                            <p className="text-gray-600 mt-2">Completed Rides</p>
                        </div>
                    </Card>
                    <Card variant="elevated" padding="md">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600">${totalSpent.toFixed(2)}</p>
                            <p className="text-gray-600 mt-2">Total Spent</p>
                        </div>
                    </Card>
                </div>

                {/* Receipts List */}
                {receipts.length === 0 ? (
                    <Card padding="lg">
                        <div className="text-center py-12">
                            <p className="text-4xl mb-4">🧾</p>
                            <p className="text-gray-500 mb-4">No receipts yet</p>
                            <p className="text-sm text-gray-400">
                                Complete a ride to see your receipts here
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {receipts.map((receipt) => (
                            <Card key={receipt._id} variant="bordered" padding="md">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">🧾</span>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    #{receipt.bookingNumber}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(receipt.scheduledDate).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 ml-10">
                                            <p>{receipt.pickup.address}</p>
                                            {receipt.dropoff && (
                                                <p className="text-gray-400">→ {receipt.dropoff.address}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${receipt.totalPrice?.toFixed(2)}
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => downloadReceipt(receipt._id)}
                                        >
                                            📥 Download PDF
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
