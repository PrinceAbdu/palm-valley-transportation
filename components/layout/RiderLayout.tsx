'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const riderNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/my-rides', label: 'My Rides', icon: '🚗' },
    { href: '/profile', label: 'Profile', icon: '👤' },
    // { href: '/notifications', label: 'Notifications', icon: '🔔' },
    // { href: '/receipts', label: 'Receipts', icon: '🧾' },
];

export default function RiderLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Sub Navigation for Rider Pages */}
            <div className="bg-white border-b sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    <nav className="flex items-center gap-1 py-2 min-w-max">
                        {riderNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${pathname === item.href
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                        <Link
                            href="/booking"
                            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 transition whitespace-nowrap"
                        >
                            + Book New Ride
                        </Link>
                    </nav>
                </div>
            </div>

            {/* Page Content */}
            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
}