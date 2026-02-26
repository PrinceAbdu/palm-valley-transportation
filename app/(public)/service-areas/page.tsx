import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Link from 'next/link';

const serviceAreas = [
    {
        name: 'Jacksonville',
        description: 'Complete coverage of Jacksonville and surrounding neighborhoods',
        neighborhoods: ['Downtown', 'Riverside', 'San Marco', 'Beaches', 'Mandarin', 'Southside'],
    },
    {
        name: 'Jacksonville Beaches',
        description: 'Serving all beach communities',
        neighborhoods: ['Jacksonville Beach', 'Atlantic Beach', 'Neptune Beach', 'Ponte Vedra Beach'],
    },
    {
        name: 'St. Augustine',
        description: 'Historic city and surrounding areas',
        neighborhoods: ['Downtown St. Augustine', 'St. Augustine Beach', 'Vilano Beach'],
    },
    {
        name: 'Surrounding Areas',
        description: 'Extended service to nearby cities',
        neighborhoods: ['Orange Park', 'Fleming Island', 'Fernandina Beach', 'Amelia Island'],
    },
];

export default function ServiceAreasPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-5xl font-bold mb-6">Service Areas</h1>
                        <p className="text-xl text-blue-100 max-w-3xl">
                            Proudly serving Jacksonville and the surrounding areas with reliable,
                            premium transportation services.
                        </p>
                    </div>
                </section>

                {/* Map Placeholder */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-6">
                                <div className="text-center">
                                    <p className="text-6xl mb-4">🗺️</p>
                                    <p className="text-gray-500">Service Area Map Placeholder</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        (Integrate Google Maps API to show coverage area)
                                    </p>
                                </div>
                            </div>
                            <p className="text-center text-gray-600">
                                <strong>Coverage Radius:</strong> Up to 50 miles from Jacksonville city center
                            </p>
                        </div>
                    </div>
                </section>

                {/* Service Areas List */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            Areas We Serve
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {serviceAreas.map((area, index) => (
                                <Card key={index} variant="elevated" padding="lg">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{area.name}</h3>
                                    <p className="text-gray-600 mb-4">{area.description}</p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Neighborhoods & Cities:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {area.neighborhoods.map((neighborhood, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                                                >
                                                    {neighborhood}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Airport Service */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <div className="text-6xl mb-4">✈️</div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Airport Transportation</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Reliable airport transfers to and from Jacksonville International Airport (JAX)
                                and other regional airports.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card padding="md" className="text-center">
                                <h3 className="font-bold text-gray-900 mb-2">Jacksonville (JAX)</h3>
                                <p className="text-sm text-gray-600">Jacksonville International Airport</p>
                            </Card>
                            <Card padding="md" className="text-center">
                                <h3 className="font-bold text-gray-900 mb-2">Orlando (MCO)</h3>
                                <p className="text-sm text-gray-600">Orlando International Airport</p>
                            </Card>
                            <Card padding="md" className="text-center">
                                <h3 className="font-bold text-gray-900 mb-2">Gainesville (GNV)</h3>
                                <p className="text-sm text-gray-600">Gainesville Regional Airport</p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Additional Info */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card padding="lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Don't See Your Area?
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    We're constantly expanding our service area. If you don't see your location listed,
                                    contact us to inquire about availability.
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
                                >
                                    Contact Us
                                </Link>
                            </Card>
                            <Card padding="lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Long-Distance Travel
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Planning a trip beyond our standard service area? We offer long-distance transportation
                                    to cities throughout Florida and neighboring states.
                                </p>
                                <Link
                                    href="/booking"
                                    className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
                                >
                                    Get a Quote
                                </Link>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-primary-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Book Your Ride?</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Wherever you need to go in Jacksonville and beyond, we're here to take you there.
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
