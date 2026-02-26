'use client';

import { useState, FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';

interface PaymentFormProps {
    bookingId: string;
    amount: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function PaymentForm({ bookingId, amount, onSuccess, onError }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/booking/confirmation?booking_id=${bookingId}`,
                },
            });

            if (error) {
                setErrorMessage(error.message || 'Payment failed');
                onError?.(error.message || 'Payment failed');
            } else {
                onSuccess?.();
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'An unexpected error occurred');
            onError?.(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">${amount.toFixed(2)}</span>
                </div>
            </div>

            <PaymentElement />

            {errorMessage && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                    <p className="text-danger-700 text-sm">{errorMessage}</p>
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                disabled={!stripe || loading}
                className="w-full"
            >
                {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </Button>

            <div className="text-center text-sm text-gray-500">
                <p>🔒 Secured by Stripe</p>
            </div>
        </form>
    );
}
