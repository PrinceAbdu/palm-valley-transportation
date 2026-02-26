import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-gray-600 mb-8">Last Updated: January 24, 2026</p>

                        <div className="prose max-w-none">
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Jacksonville Rides services, you accept and agree to be bound by the terms and provision of this agreement.
                            </p>

                            <h2>2. Service Description</h2>
                            <p>
                                Jacksonville Rides provides private transportation services within Jacksonville, Florida and surrounding areas. We are not a taxi service or ride-sharing platform.
                            </p>

                            <h2>3. Booking and Payment</h2>
                            <p>
                                All bookings must be made through our website. Payment is required at the time of booking. Accepted payment methods include all major credit cards.
                            </p>

                            <h2>4. Cancellation Policy</h2>
                            <p>
                                Please refer to our separate <a href="/legal/cancellation-policy" className="text-primary-600 hover:underline">Cancellation Policy</a> for detailed information.
                            </p>

                            <h2>5. User Responsibilities</h2>
                            <ul>
                                <li>Provide accurate pickup and drop-off information</li>
                                <li>Be ready at the scheduled pickup time</li>
                                <li>Treat drivers and vehicles with respect</li>
                                <li>Follow safety guidelines and local laws</li>
                            </ul>

                            <h2>6. Limitation of Liability</h2>
                            <p>
                                Jacksonville Rides shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
                            </p>

                            <h2>7. Contact Information</h2>
                            <p>
                                For questions about these Terms, please contact us at legal@jacksonvillerides.com or call (904) 555-0123.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
