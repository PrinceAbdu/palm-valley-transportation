'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const adminNavItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { href: '/admin/drivers', label: 'Drivers', icon: '🚗' },
    { href: '/admin/vehicles', label: 'Vehicles', icon: '🚐' },
    { href: '/admin/users', label: 'Customers', icon: '👥' },
    { href: '/admin/popular-places', label: 'Popular Places', icon: '📍' },
    { href: '/admin/reports', label: 'Reports', icon: '📈' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize(); // trigger on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.role !== 'admin') {
                router.push('/login');
                return;
            }
            setUser(parsed);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex relative">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'
                    }`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-gray-700">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/images/862bc6c8-09c6-4712-8cc3-88d21f7f6841.jpg.jpeg"
                            alt="PalmValley Transportation"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        {isSidebarOpen && (
                            <div>
                                <span className="text-lg font-bold text-white">PalmValley</span>
                                <p className="text-xs text-gray-400">Admin Panel</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {adminNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${pathname === item.href || pathname?.startsWith(item.href + '/')
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Toggle Sidebar */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-4 border-t border-gray-700 text-gray-400 hover:text-white transition"
                >
                    {isSidebarOpen ? '◀ Collapse' : '▶'}
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen w-full lg:w-auto overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 shrink-0"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[120px] sm:max-w-xs">
                            {adminNavItems.find(item => pathname?.startsWith(item.href))?.label || 'Admin'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <Link
                            href="/"
                            className="hidden sm:flex text-sm text-gray-600 hover:text-primary-600 transition items-center gap-1"
                        >
                            <span aria-hidden="true">🏠</span>
                            <span className="hidden md:inline">Home</span>
                        </Link>
                        {user && (
                            <span className="hidden md:flex text-sm text-gray-500 items-center gap-1">
                                <span aria-hidden="true">👤</span>
                                <span className="truncate max-w-[150px]">{user.firstName} {user.lastName}</span>
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}