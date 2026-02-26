import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
                        <p className="text-gray-600 mb-8">Last Updated: January 24, 2026</p>

                        <div className="prose max-w-none">
                            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
                                <p className="text-sm text-primary-900">
                                    This Refund Policy works in conjunction with our{' '}
                                    <Link href="/legal/cancellation-policy" className="font-semibold underline">
                                        Cancellation Policy
                                    </Link>
                                    . Please review both documents for complete information.
                                </p>
                            </div>

                            <h2>Refund Eligibility</h2>

                            <h3>Full Refund (100%)</h3>
                            <p>You are eligible for a full refund in the following situations:</p>
                            <ul>
                                <li>Cancellation made more than 24 hours before scheduled pickup</li>
                                <li>Jacksonville Rides cancels your booking for any reason</li>
                                <li>Driver fails to arrive within 30 minutes of scheduled time</li>
                                <li>Service failure on our part (vehicle breakdown, driver no-show)</li>
                                <li>Duplicate charges or billing errors</li>
                            </ul>

                            <h3>Partial Refund (50%)</h3>
                            <p>You may receive a 50% refund if:</p>
                            <ul>
                                <li>Cancellation made less than 24 hours but more than 2 hours before pickup</li>
                                <li>Trip is significantly delayed due to our fault (more than 1 hour)</li>
                            </ul>

                            <h3>No Refund</h3>
                            <p>No refund will be issued for:</p>
                            <ul>
                                <li>No-shows (passenger not present within 15 minutes of scheduled time)</li>
                                <li>Cancellations made less than 2 hours before pickup</li>
                                <li>Customer-caused delays or changes to destination mid-trip</li>
                                <li>Completed trips</li>
                            </ul>

                            <h2>Refund Process</h2>

                            <h3>Processing Time</h3>
                            <p>
                                Approved refunds are processed within <strong>5-7 business days</strong> from the date of approval. The refund will be credited to the original payment method used for booking.
                            </p>

                            <h3>How to Request a Refund</h3>
                            <ol>
                                <li><strong>Contact Us:</strong> Reach out via phone, email, or your account dashboard</li>
                                <li><strong>Provide Details:</strong> Include your booking number and reason for refund</li>
                                <li><strong>Review:</strong> We'll review your request within 24 hours</li>
                                <li><strong>Notification:</strong> You'll receive an email with the decision</li>
                                <li><strong>Processing:</strong> If approved, refund is processed to your card</li>
                            </ol>

                            <h2>Contact for Refunds</h2>
                            <ul>
                                <li><strong>Phone:</strong> (904) 555-0123 (24/7)</li>
                                <li><strong>Email:</strong> refunds@jacksonvillerides.com</li>
                                <li><strong>Dashboard:</strong> Log in to your account and visit "My Rides"</li>
                            </ul>

                            <h2>Disputes</h2>
                            <p>
                                If you disagree with a refund decision, you may appeal by contacting our customer service team. We will review all disputes within 48 hours and provide a final decision.
                            </p>

                            <h2>Chargebacks</h2>
                            <p>
                                We encourage you to contact us directly before initiating a chargeback with your bank. Chargebacks may result in account suspension and additional fees. We're committed to resolving all payment issues fairly and promptly.
                            </p>

                            <h2>Special Circumstances</h2>
                            <p>
                                We understand that emergencies and unexpected situations occur. If you have extenuating circumstances (medical emergency, flight cancellation, natural disaster, etc.), please contact us directly. We evaluate each case individually and may offer exceptions to our standard refund policy.
                            </p>

                            <h2>Promotional Credits</h2>
                            <p>
                                In some cases, instead of a monetary refund, we may offer promotional credits for future rides. These credits:
                            </p>
                            <ul>
                                <li>Never expire</li>
                                <li>Can be used for any future booking</li>
                                <li>Are non-transferable</li>
                                <li>Will be applied automatically at checkout</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
