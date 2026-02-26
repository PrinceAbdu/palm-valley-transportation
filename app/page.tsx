import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/homepage/Hero';
import PopularPlaces from '@/components/homepage/PopularPlaces';
import TrustSection from '@/components/homepage/TrustSection';
import FleetPreview from '@/components/homepage/FleetPreview';
import Testimonials from '@/components/homepage/Testimonials';
import FAQ from '@/components/homepage/FAQ';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Hero />
                <PopularPlaces />
                <TrustSection />
                <FleetPreview />
                <Testimonials />
                <FAQ />
            </main>
            <Footer />
        </div>
    );
}
