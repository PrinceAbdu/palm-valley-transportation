'use client';
import { useState, useEffect } from 'react';

import { api } from '@/lib/api';

interface PopularPlace {
  _id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
  mapLink?: string;
}

export default function PopularPlaces() {
  const [places, setPlaces] = useState<PopularPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await api('/api/popular-places');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setPlaces(data.data);
        }
      } catch (error) {
        console.error('Error fetching popular places:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  if (loading || places.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
          <p className="text-gray-500 mt-2">
            Explore our most requested pickup and drop-off locations across Jacksonville and beyond.
          </p>
        </div>

        {/* Cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {places.map((place) => (
            <div
              key={place._id}
              className="flex-shrink-0 w-80 rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-44 w-full">
                {place.imageUrl ? (
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-green-100 flex items-center justify-center text-4xl">
                    🌴
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Icon Badge */}
                <div className="absolute top-3 left-3 bg-white rounded-xl p-2 text-xl shadow">
                  {place.icon}
                </div>
              </div>

              {/* Content — tight padding, no extra space */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {place.name}
                  </h3>
                </div>

                <p className="text-gray-500 text-xs mt-1 leading-snug">
                  {place.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Service Coverage */}
       <div className="relative mt-12  bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pattern-dots" />

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm font-medium mb-6 border border-primary-500/30">
                                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                                Service Coverage
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">
                                300-Mile Service Radius
                            </h3>
                            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                                We proudly serve Jacksonville and surrounding areas within a 300-mile radius of downtown.
                            </p>
                            <ul className="grid grid-cols-2 gap-3">
                                {['St. Augustine', 'Orange Park', 'Ponte Vedra', 'Fernandina Bch', 'St. Marys, GA', 'JAX Airport'].map((city, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                                        <svg className="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {city}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition duration-300">
                            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                                <span className="text-3xl">📍</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Outside our range?</h4>
                            <p className="text-gray-400 text-sm mb-6">
                                We offer custom quotes for long-distance trips across Florida and Georgia.
                            </p>
                            <a
                                href="tel:9045550123"
                                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                (904) 582-6118
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
