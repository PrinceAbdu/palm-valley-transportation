'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to send reset email');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                            <p className="text-gray-600">We'll send you reset instructions</p>
                        </div>

                        {success ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">✓</span>
                                </div>
                                <p className="text-gray-700 mb-6">
                                    If an account exists with this email, you will receive password reset instructions.
                                </p>
                                <Link href="/login">
                                    <Button variant="primary" className="w-full">
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />

                                    <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                                        Send Reset Link
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700">
                                        ← Back to Sign In
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
