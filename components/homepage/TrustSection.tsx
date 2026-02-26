export default function TrustSection() {
    const features = [
        {
            icon: '🛡️',
            title: 'Licensed & Insured',
            description: 'Fully licensed and insured for your peace of mind. Professional service you can trust.',
        },
        {
            icon: '⭐',
            title: 'Professional Drivers',
            description: 'Experienced, courteous drivers who know Jacksonville inside and out.',
        },
        {
            icon: '⏰',
            title: 'On-Time Guarantee',
            description: 'We value your time. Count on us to be there when you need us.',
        },
        {
            icon: '🚗',
            title: 'Premium Fleet',
            description: 'Clean, well-maintained vehicles with modern amenities for your comfort.',
        },
        {
            icon: '💳',
            title: 'Secure Payments',
            description: 'Safe and secure payment processing with transparent pricing.',
        },
        {
            icon: '📞',
            title: '24/7 Support',
            description: 'Round-the-clock customer support for your convenience.',
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Why Choose Palm Valley Transportation?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We're committed to providing the best private transportation experience in Jacksonville
                    </p>
                </div>

                <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-premium-lg transition group flex-shrink-0 w-[85%] sm:w-[70%] md:w-auto"
                        >
                            <div className="text-5xl mb-4 group-hover:scale-110 transition">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

              
            </div>
        </section>
    );
}
