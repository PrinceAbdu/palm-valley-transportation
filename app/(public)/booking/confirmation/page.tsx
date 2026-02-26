'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const status = searchParams.get('status'); // 'success' | 'cancelled'
    const bookingId = searchParams.get('bookingId');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking booking status if needed
        if (status) {
            setLoading(false);
        } else {
            // Default "just booked" state if no params (fallback)
            setLoading(false);
        }
    }, [status]);

    if (loading) return <Spinner size="lg" />;

    if (status === 'cancelled') {
        return (
            <Card variant="elevated" padding="lg" className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">❌</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
                <p className="text-gray-600 mb-8">
                    You have cancelled the payment. Your booking remains in 'quoted' status.
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => router.push('/')}>Return Home</Button>
                </div>
            </Card>
        );
    }

    if (status === 'success') {
        return (
            <Card variant="elevated" padding="lg" className="max-w-2xl mx-auto text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <span className="text-5xl">🎉</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                <p className="text-xl text-gray-600 mb-2">
                    Thank you! Your trip is now fully confirmed.
                </p>
                <p className="text-gray-500 mb-8">
                    We've sent a confirmation email with all the details and your driver info.
                </p>

                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🚀</span> Next Steps
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="text-green-500 font-bold">✓</span>
                            <span className="text-gray-700">Your driver will be assigned shortly</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-green-500 font-bold">✓</span>
                            <span className="text-gray-700">You'll receive a reminder 24 hours before your trip</span>
                        </li>
                    </ul>
                </div>

                <div className="flex justify-center gap-4">
                    <Button onClick={() => router.push('/dashboard')}>
                        View My Bookings
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Back to Home
                    </Button>
                </div>
            </Card>
        );
    }

    // Default fallback (if accessed directly or via old link)
    return (
        <Card variant="elevated" padding="lg" className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Received!</h1>
            <p className="text-xl text-gray-600 mb-6">
                We have received your booking request.
            </p>
            <p className="text-gray-500 mb-8">
                Please check your email for a price quote and payment link.
            </p>
            <Button onClick={() => router.push('/')}>Back to Home</Button>
        </Card>
    );
}

export default function ConfirmationPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 py-12 px-4">
                <Suspense fallback={<div className="flex justify-center"><Spinner size="lg" /></div>}>
                    <ConfirmationContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
