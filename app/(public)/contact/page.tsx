'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement contact form submission in future
        // For now, just simulate submission
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
                        <p className="text-xl text-blue-100 max-w-3xl">
                            Have questions? We're here to help. Reach out to us anytime.
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Contact Form */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                                {submitted ? (
                                    <div className="bg-success-50 border border-success-200 rounded-lg p-6">
                                        <h3 className="text-success-700 font-bold mb-2">Thank You!</h3>
                                        <p className="text-success-600">
                                            We've received your message and will get back to you within 24 hours.
                                        </p>
                                    </div>
                                ) : (
                                    <Card padding="lg">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <Input
                                                label="Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                            <Input
                                                label="Email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                            <Input
                                                label="Phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                            <Input
                                                label="Subject"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Message
                                                </label>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    rows={5}
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" variant="primary" disabled={loading} className="w-full">
                                                {loading ? 'Sending...' : 'Send Message'}
                                            </Button>
                                        </form>
                                    </Card>
                                )}
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
                                <div className="space-y-6">
                                    <Card padding="lg">
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl">📞</div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                                                <p className="text-gray-600">(904) 582-6118</p>
                                                <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card padding="lg">
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl">📧</div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                                                <p className="text-gray-600">palmvalleytransportation@gmail.com</p>
                                                <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* <Card padding="lg">
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl">📍</div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">Office</h3>
                                                <p className="text-gray-600">
                                                    123 Palm Valley Road<br />
                                                    Jacksonville, FL 32250
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">By appointment only</p>
                                            </div>
                                        </div>
                                    </Card> */}

                                    <Card padding="lg">
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl">🕐</div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">Business Hours</h3>
                                                <p className="text-gray-600">
                                                    Service: 24/7<br />
                                                    Office: Mon-Fri 8AM-6PM EST
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Emergency Contact */}
                                <div className="mt-6 bg-danger-50 border border-danger-200 rounded-lg p-4">
                                    <h3 className="font-bold text-danger-700 mb-2">Emergency Support</h3>
                                    <p className="text-danger-600 text-sm">
                                        For urgent assistance during your ride, call our 24/7 emergency line:
                                        <strong> (904) 582-6118</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Link */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Looking for Quick Answers?</h2>
                        <p className="text-gray-600 mb-6">
                            Check out our frequently asked questions for instant answers to common inquiries.
                        </p>
                        <a
                            href="/#faq"
                            className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
                        >
                            View FAQs
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
