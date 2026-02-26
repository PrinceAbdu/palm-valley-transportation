'use client';

export default function TestimonialsSection() {
    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Business Executive',
            rating: 5,
            text: 'Palm Valley Transportation has been my go-to for airport transfers. Always on time, professional drivers, and immaculate vehicles. Highly recommend!',
            image: '👩‍💼',
        },
        {
            name: 'Michael Chen',
            role: 'Tourist',
            rating: 5,
            text: 'Booked a round-trip from the airport to Amelia Island. The meet & greet service was fantastic, and the driver knew all the best spots in Jacksonville.',
            image: '👨',
        },
        {
            name: 'Emily Rodriguez',
            role: 'Local Resident',
            rating: 5,
            text: 'Used them for our wedding transportation. The luxury van was perfect for our group, and the driver was incredibly accommodating. Worth every penny!',
            image: '👰',
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        What Our Clients Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Don't just take our word for it - here's what Jacksonville residents and visitors have to say
                    </p>
                </div>

                {/* Testimonials */}
                <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex-shrink-0 w-[85%] sm:w-[70%] md:w-auto"
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <span key={i} className="text-secondary-500 text-xl">⭐</span>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-700 mb-6 italic">
                                "{testimonial.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl">
                                    {testimonial.image}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
                    <div>
                        <div className="text-3xl font-bold text-primary-600">500+</div>
                        <div className="text-sm text-gray-600">Happy Clients</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-primary-600">4.9/5</div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-primary-600">98%</div>
                        <div className="text-sm text-gray-600">On-Time Rate</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-primary-600">5 Years</div>
                        <div className="text-sm text-gray-600">Serving Jacksonville</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
