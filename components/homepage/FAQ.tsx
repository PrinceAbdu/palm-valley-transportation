'use client';

import { useState } from 'react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: 'How do I book a ride?',
            answer: 'Booking is easy! Simply click "Book a Ride" button, enter your trip details including pickup and drop-off locations, select your preferred vehicle, and complete payment. You\'ll receive instant confirmation.',
        },
        {
            question: 'What is your cancellation policy?',
            answer: 'You can cancel up to 24 hours before your scheduled ride for a full refund. Cancellations within 24 hours are subject to a 50% cancellation fee. No-shows are non-refundable.',
        },
        {
            question: 'Are your drivers licensed and insured?',
            answer: 'Yes! All our drivers are fully licensed, background-checked, and insured. We maintain the highest safety standards and our vehicles undergo regular inspections.',
        },
        {
            question: 'Do you offer airport pickups?',
            answer: 'Absolutely! We specialize in Jacksonville International Airport (JAX) transfers. We track your flight and adjust pickup time if there are delays. Meet & greet service is available for an additional fee.',
        },
        {
            question: 'What areas do you serve?',
            answer: 'We serve all of Jacksonville and surrounding areas within a 50-mile radius, including beaches, downtown, St. Augustine, Orange Park, Ponte Vedra, and more.',
        },
        {
            question: 'How is pricing calculated?',
            answer: 'Pricing is based on distance, estimated duration, vehicle type, and any additional services (like airport fees or meet & greet). You\'ll see the total price before booking - no hidden fees!',
        },
        {
            question: 'Can I request a specific driver?',
            answer: 'While we can\'t guarantee specific drivers, you can add preferences in the booking notes. We\'ll do our best to accommodate your request.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) processed securely through Stripe. Payment is required at time of booking.',
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-gray-600">
                        Everything you need to know about Jacksonville Rides
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition"
                            >
                                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                                <span className={`text-primary-500 text-2xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                                    ↓
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">Still have questions?</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
                    >
                        Contact our support team
                        <span>→</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
