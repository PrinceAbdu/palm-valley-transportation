'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import { api } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripeCheckoutProps {
    bookingId: string;
    amount: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function StripeCheckout({ bookingId, amount, onSuccess, onError }: StripeCheckoutProps) {
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        createPaymentIntent();
    }, [bookingId]);

    const createPaymentIntent = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api('/api/payments/create-intent', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookingId }),
            });

            const data = await response.json();
            if (data.success) {
                setClientSecret(data.data.clientSecret);
            } else {
                setError(data.error || 'Failed to initialize payment');
                onError?.(data.error);
            }
        } catch (err) {
            const errorMsg = 'Failed to initialize payment';
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading payment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <p className="text-danger-700">{error}</p>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#1e3a8a',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                colorDanger: '#dc2626',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '8px',
            },
        },
    };

    return (
        <div className="max-w-md mx-auto">
            {clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                    <PaymentForm
                        bookingId={bookingId}
                        amount={amount}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                </Elements>
            )}
        </div>
    );
}
