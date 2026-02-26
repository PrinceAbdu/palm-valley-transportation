'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check for user
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Scroll listener
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const navLinks = [
        { href: '/about', label: 'About' },
        { href: '/fleet', label: 'Fleet' },
        // { href: '/service-areas', label: 'Service Areas' },
        { href: '/contact', label: 'Contact' },
    ];

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            default: return '/dashboard';
        }
    };

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-lg shadow-lg'
                : 'bg-white shadow-sm'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src="/images/862bc6c8-09c6-4712-8cc3-88d21f7f6841.jpg.jpeg"
                            alt="PalmValley Transportation"
                            width={44}
                            height={44}
                            className="rounded-full shadow-lg group-hover:shadow-xl transition-all"
                        />
                        <div className="hidden sm:block">
                            <span className="text-xl font-bold text-primary-600">PalmValley</span>
                            <span className="text-xl font-bold text-secondary-500 ml-1">Transportation</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === link.href
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions & Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {user ? (
                            <>
                                <Link
                                    href={getDashboardLink()}
                                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
                                >
                                    <span className="text-lg">
                                        {user.role === 'admin' ? '⚙️' : '👤'}
                                    </span>
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden sm:block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-primary-600 transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/booking"
                                    className="hidden sm:flex px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition"
                                >
                                    Book Now
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Button - Always visible on small screens */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -mr-2 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t fade-in">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-3 rounded-lg font-medium transition ${pathname === link.href
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="my-2 border-gray-100" />
                            {user ? (
                                <>
                                    <Link
                                        href={getDashboardLink()}
                                        className="px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-xl">
                                            {user.role === 'admin' ? '⚙️' : '👤'}
                                        </span>
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/booking"
                                        className="px-4 py-3 mt-2 rounded-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 transition text-center"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Book Now
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
