import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CancellationPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                        <h1 className="text-4xl font-bold mb-4">Cancellation & Refund Policy</h1>
                        <p className="text-gray-600 mb-8">Last Updated: January 24, 2026</p>

                        <div className="prose max-w-none">
                            <h2>Cancellation by Customer</h2>

                            <h3>More than 24 Hours Before Scheduled Ride</h3>
                            <p>
                                You may cancel your booking for a <strong>full refund</strong> if cancelled at least 24 hours before your scheduled pickup time.
                            </p>

                            <h3>Less than 24 Hours Before Scheduled Ride</h3>
                            <p>
                                Cancellations made within 24 hours of your scheduled pickup time are subject to a <strong>50% cancellation fee</strong>. You will receive a 50% refund of your payment.
                            </p>

                            <h3>No-Shows</h3>
                            <p>
                                If you are not present at the pickup location within 15 minutes of the scheduled time, the ride will be marked as a no-show and is <strong>non-refundable</strong>.
                            </p>

                            <h2>Cancellation by Jacksonville Rides</h2>
                            <p>
                                In the rare event that we must cancel your ride (due to driver unavailability, weather, or other circumstances), you will receive a <strong>full refund</strong> within 3-5 business days.
                            </p>

                            <h2>Refund Processing</h2>
                            <p>
                                Approved refunds will be processed within 5-7 business days to the original payment method used for booking.
                            </p>

                            <h2>How to Cancel</h2>
                            <p>
                                To cancel a booking, please contact us at:
                            </p>
                            <ul>
                                <li>Phone: (904) 555-0123</li>
                                <li>Email: support@jacksonvillerides.com</li>
                                <li>Or through your account dashboard</li>
                            </ul>

                            <h2>Special Circumstances</h2>
                            <p>
                                We understand that emergencies happen. If you have extenuating circumstances (medical emergency, flight cancellation, etc.), please contact us directly. We evaluate each case individually and may offer exceptions to this policy.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
