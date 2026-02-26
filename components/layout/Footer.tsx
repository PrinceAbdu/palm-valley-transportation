import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-500 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <Image
                                src="/images/862bc6c8-09c6-4712-8cc3-88d21f7f6841.jpg.jpeg"
                                alt="PalmValley Transportation"
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                            <div>
                                <span className="text-xl font-bold text-white">PalmValley</span>
                                <span className="text-xl font-bold text-secondary-400 ml-1">Transportation</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
                            Premium private transportation services in Jacksonville, Florida.
                            Experience the difference with our professional drivers and luxury fleet.
                        </p>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-3">
                            <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                <span className="text-green-400">✓</span>
                                <span className="text-sm text-gray-300">Licensed & Insured</span>
                            </div>
                            <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                                <span className="text-green-400">✓</span>
                                <span className="text-sm text-gray-300">24/7 Service</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {[
                                { href: '/booking', label: 'Book a Ride' },
                                { href: '/about', label: 'About Us' },
                                { href: '/fleet', label: 'Our Fleet' },
                                { href: '/service-areas', label: 'Service Areas' },
                                { href: '/contact', label: 'Contact' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <span className="w-0 group-hover:w-2 h-0.5 bg-secondary-400 transition-all duration-200" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Legal</h4>
                        <ul className="space-y-4">
                            {[
                                { href: '/legal/terms', label: 'Terms of Service' },
                                { href: '/legal/privacy', label: 'Privacy Policy' },
                                { href: '/legal/cancellation-policy', label: 'Cancellation Policy' },
                                { href: '/legal/refund-policy', label: 'Refund Policy' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="tel:+19045826118"
                                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                                        📞
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Call us</p>
                                        <p className="font-medium text-white">904-582-6118</p>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:info@palmvalleytrans.com"
                                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                                        ✉️
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email us</p>
                                        <p className="font-medium text-white">info@palmvalleytrans.com</p>
                                    </div>
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                                    📍
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium text-white">Jacksonville, FL</p>
                                </div>
                            </li>
                        </ul>

                        {/* Social Links */}
                        <div className="mt-6">
                            <p className="text-sm text-gray-500 mb-3">Follow us</p>
                            <div className="flex gap-3">
                                {['facebook', 'twitter', 'instagram'].map((social) => (
                                    <a
                                        key={social}
                                        href={`https://${social}.com`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary-500/20 transition-colors"
                                    >
                                        {social === 'facebook' && '📘'}
                                        {social === 'twitter' && '🐦'}
                                        {social === 'instagram' && '📸'}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} PalmValley Transportation. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>🔒 Secure Payments</span>
                            <span>💳 All Major Cards Accepted</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
