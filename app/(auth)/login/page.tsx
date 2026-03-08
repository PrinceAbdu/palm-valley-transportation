'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || errors.general) {
            setErrors({});
        }
    };

    const handleGoogleCallback = useCallback(async (response: { credential?: string }) => {
        if (response.credential) {
            setLoading(true);
            try {
                const apiResponse = await api('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idToken: response.credential,
                    }),
                });

                const data = await apiResponse.json();

                if (data.success) {
                    localStorage.setItem('token', data.data.token);
                    localStorage.setItem('user', JSON.stringify(data.data.user));

                    const role = data.data.user.role;
                    if (role === 'admin') {
                        router.push('/admin/dashboard');
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    setErrors({ general: data.error || 'Google login failed' });
                }
            } catch (error) {
                setErrors({ general: 'An error occurred during Google login' });
            } finally {
                setLoading(false);
            }
        }
    }, [router]);

    useEffect(() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Google login disabled.');
            return;
        }

        const initGoogle = () => {
            const google = (window as any).google;
            if (!google?.accounts?.id) return;

            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleCallback,
            });

            const container = document.getElementById('google-signin-container');
            if (container) {
                container.innerHTML = '';
                google.accounts.id.renderButton(container, {
                    theme: 'outline',
                    size: 'large',
                    shape: 'rectangular',
                    width: 360,
                    text: 'continue_with',
                });
            }

            setGoogleReady(true);
        };

        const existingScript = document.getElementById('google-gsi-script') as HTMLScriptElement | null;
        if (existingScript) {
            initGoogle();
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        script.onerror = () => setErrors({ general: 'Failed to load Google Sign-In.' });
        document.head.appendChild(script);

        return () => {
            // Keep script loaded across route changes to avoid reloading GIS repeatedly.
        };
    }, [handleGoogleCallback]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setErrors({ general: 'Please enter both email and password' });
            return;
        }

        setLoading(true);

        try {
            const response = await api('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                // Store token and user data
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                // Redirect based on role
                const role = data.data.user.role;
                if (role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setErrors({ general: data.error || 'Login failed' });
            }
        } catch (error) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-premium">
            <Header />
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md fade-in">
                    {/* Card */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                                <span className="text-3xl">🔐</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                            <p className="text-gray-500">Sign in to your account to continue</p>
                        </div>

                        {/* Error Message */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.general}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                }
                                required
                            />

                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                iconPosition="right"
                                icon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                <path d="M15.171 13.576l1.414 1.414A10.015 10.015 0 0120.514 10c-1.274-4.057-5.064-7-9.514-7a9.958 9.958 0 00-2.037.242l2.026 2.026a4 4 0 115.669 5.669z" />
                                            </svg>
                                        )}
                                    </button>
                                }
                                required
                            />

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                    />
                                    <span className="text-gray-600">Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                isLoading={loading}
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-sm text-gray-400">or continue with</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Google Sign-In */}
                        <div className="w-full flex flex-col items-center gap-2">
                            <div id="google-signin-container" className="w-full flex justify-center" />
                            {!googleReady && (
                                <p className="text-xs text-gray-500">Loading Google Sign-In...</p>
                            )}
                        </div>

                        {/* Sign Up Link */}
                        <p className="mt-8 text-center text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* Footer Text */}
                    <p className="mt-6 text-center text-sm text-gray-400">
                        By signing in, you agree to our{' '}
                        <Link href="/terms" className="text-gray-600 hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-gray-600 hover:underline">Privacy Policy</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
