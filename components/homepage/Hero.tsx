'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/components/maps/LocationPicker';

export default function Hero() {
    const router = useRouter();
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleGetEstimate = () => {
        const params = new URLSearchParams();
        if (pickup) params.append('pickup', pickup);
        if (dropoff) params.append('dropoff', dropoff);
        if (date) params.append('date', date);
        if (time) params.append('time', time);
        
        router.push(`/booking?${params.toString()}`);
    };

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                >
                    <source src="/videos/JaxDrone.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Overlay Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/75 to-primary-950/85">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-3.486 3.485-1.414 1.415L32 0z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Column - Content */}
                    <div className="text-white slide-up">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-white/10">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                            </span>
                            <span className="text-sm font-medium">Serving Jacksonville Since 2020</span>
                        </div>

                        <h1 className="text-5xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                            Premium Rides in
                            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-yellow-300">
                                Jacksonville
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl mb-4 text-primary-100/90 leading-relaxed font-light">
                            Professional drivers. Reliable service.
                            <span className="font-medium text-white"> Unbeatable rates.</span>
                        </p>

                        <p className="text-lg mb-8 text-primary-200/80">
                            Airport transfers, cruise port, beaches, downtown — we&apos;ve got you covered.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-10">
                            {[
                                { icon: '✓', text: 'Licensed & Insured' },
                                { icon: '✓', text: '24/7 Availability' },
                                { icon: '✓', text: 'On-Time Guarantee' },
                            ].map((badge, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10"
                                >
                                    <span className="text-green-400 font-bold">{badge.icon}</span>
                                    <span className="text-sm font-medium">{badge.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/booking"
                                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-bold rounded-2xl hover:from-secondary-600 hover:to-secondary-700 transition-all shadow-2xl shadow-secondary-500/30 hover:shadow-secondary-500/40 hover:-translate-y-1 text-lg"
                            >
                                Book Your Ride
                                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/fleet"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl hover:bg-white/20 transition-all border-2 border-white/20 text-lg"
                            >
                                View Fleet
                            </Link>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/10">
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {['👤', '👤', '👤', '👤'].map((emoji, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-primary-600 border-2 border-primary-800 flex items-center justify-center text-lg">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-sm text-primary-200">
                                        <span className="font-semibold text-white">2,500+</span> happy customers
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quote Form */}
                    <div className="scale-in">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 text-gray-900 border border-white/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                                    <span className="text-white text-2xl">🚗</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Get Instant Quote</h2>
                                    <p className="text-sm text-gray-500">No hidden fees, transparent pricing</p>
                                </div>
                            </div>

                            <form className="space-y-5">
                                <div>
                                    <LocationPicker
                                        label="Pickup Location"
                                        value={pickup}
                                        onChange={(address) => setPickup(address)}
                                        placeholder="Enter pickup address..."
                                    />
                                </div>

                                <div>
                                    <LocationPicker
                                        label="Drop-off Location"
                                        value={dropoff}
                                        onChange={(address) => setDropoff(address)}
                                        placeholder="Enter destination..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGetEstimate}
                                    className="block w-full text-center px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 text-lg"
                                >
                                    Get Free Estimate →
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        No account needed
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Secure booking
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                </svg>
            </div>
        </section>
    );
}
