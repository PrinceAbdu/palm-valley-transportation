import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-gray-600 mb-8">Last Updated: January 24, 2026</p>

                        <div className="prose max-w-none">
                            <h2>1. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us when you create an account, book a ride, or communicate with us. This includes:
                            </p>
                            <ul>
                                <li>Name, email address, and phone number</li>
                                <li>Payment information (processed securely through Stripe)</li>
                                <li>Pickup and drop-off locations</li>
                                <li>Trip history and preferences</li>
                            </ul>

                            <h2>2. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul>
                                <li>Provide, maintain, and improve our transportation services</li>
                                <li>Process your bookings and payments</li>
                                <li>Send you confirmations, updates, and support messages</li>
                                <li>Respond to your comments and questions</li>
                                <li>Prevent fraud and enhance security</li>
                            </ul>

                            <h2>3. Information Sharing</h2>
                            <p>
                                We do not sell your personal information. We may share your information with:
                            </p>
                            <ul>
                                <li><strong>Drivers:</strong> We share necessary trip details with assigned drivers</li>
                                <li><strong>Service Providers:</strong> Payment processors (Stripe), SMS services (Twilio), email services (SendGrid)</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                            </ul>

                            <h2>4. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
                            </p>

                            <h2>5. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul>
                                <li>Access your personal information</li>
                                <li>Correct inaccurate information</li>
                                <li>Request deletion of your information</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>

                            <h2>6. Cookies and Tracking</h2>
                            <p>
                                We use cookies and similar tracking technologies to improve your experience on our website. You can control cookies through your browser settings.
                            </p>

                            <h2>7. Children's Privacy</h2>
                            <p>
                                Our services are not intended for children under 18. We do not knowingly collect information from children.
                            </p>

                            <h2>8. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                            </p>

                            <h2>9. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, please contact us at:
                            </p>
                            <ul>
                                <li>Email: privacy@jacksonvillerides.com</li>
                                <li>Phone: (904) 555-0123</li>
                                <li>Address: Jacksonville, FL 32202</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
