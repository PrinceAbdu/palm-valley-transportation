import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';
import Logo from "./../../../public/images/862bc6c8-09c6-4712-8cc3-88d21f7f6841.jpg.jpeg";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-5xl font-bold mb-6">About Palm Valley Transportation</h1>
                        <p className="text-xl text-blue-100 max-w-3xl">
                            Your trusted transportation partner in Jacksonville, Florida. We're committed to providing safe, reliable, and premium transportation services.
                        </p>
                    </div>
                </section>

                {/* Our Story */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                                <p className="text-gray-600 mb-4">
                                    Founded in Jacksonville, Florida, Palm Valley Transportation was built on a simple principle:
                                    transportation should be reliable, comfortable, and stress-free.
                                </p>
                                <p className="text-gray-600 mb-4">
                                    With years of experience serving the Jacksonville metro area, we've grown from a single vehicle
                                    to a comprehensive fleet, but our commitment to personalized service remains unchanged.
                                </p>
                                <p className="text-gray-600">
                                    We understand that every journey matters—whether it's an airport transfer, corporate event,
                                    or special occasion—and we're dedicated to making each trip exceptional.
                                </p>
                            </div>
                            <div className="relative rounded-lg overflow-hidden shadow-xl h-96">
    <Image
        src={Logo}
        alt="Palm Valley Transportation Logo"
        fill
        className="object-center"
        priority
    />
</div>
                        </div>
                    </div>
                </section>

                {/* Our Values */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card padding="lg">
                                <div className="text-4xl mb-4">🛡️</div>
                                <h3 className="text-xl font-bold mb-3">Safety First</h3>
                                <p className="text-gray-600">
                                    All our drivers are thoroughly vetted, licensed, and trained. Our vehicles undergo regular
                                    maintenance and safety inspections.
                                </p>
                            </Card>
                            <Card padding="lg">
                                <div className="text-4xl mb-4">⭐</div>
                                <h3 className="text-xl font-bold mb-3">Premium Service</h3>
                                <p className="text-gray-600">
                                    From our well-maintained fleet to our professional drivers, we ensure every detail
                                    meets our high standards of excellence.
                                </p>
                            </Card>
                            <Card padding="lg">
                                <div className="text-4xl mb-4">🤝</div>
                                <h3 className="text-xl font-bold mb-3">Reliability</h3>
                                <p className="text-gray-600">
                                    We're on time, every time. Our 24/7 availability and real-time tracking ensure
                                    you're never left waiting.
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="flex gap-4">
                                <div className="text-2xl text-primary-600">✓</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Licensed & Insured</h3>
                                    <p className="text-gray-600">Fully licensed with comprehensive insurance coverage for your peace of mind.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-2xl text-primary-600">✓</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Professional Drivers</h3>
                                    <p className="text-gray-600">Experienced, courteous drivers committed to your comfort and safety.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-2xl text-primary-600">✓</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Modern Fleet</h3>
                                    <p className="text-gray-600">Well-maintained vehicles with premium amenities and comfortable seating.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-2xl text-primary-600">✓</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">24/7 Availability</h3>
                                    <p className="text-gray-600">Book anytime, day or night. We're here when you need us.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-primary-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Experience Premium Transportation?</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Book your ride today and discover the Palm Valley Transportation difference.
                        </p>
                        <Link
                            href="/booking"
                            className="inline-block px-8 py-4 bg-secondary-500 text-white font-semibold rounded-lg hover:bg-secondary-600 transition shadow-lg"
                        >
                            Book Now
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
