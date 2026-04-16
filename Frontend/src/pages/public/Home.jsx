import { Link } from 'react-router-dom';
import { MapPin, Shield, Clock, Star, ArrowRight, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAllCars } from '@/hooks/useCars';
import { useAllLocations } from '/src/hooks/useLocations.js';
import { useCompany } from '@/hooks/useCompany';
import CarList from '@/components/cars/CarList';

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ company }) {
    return (
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Car className="h-10 w-10 text-primary" />
                    <span className="text-3xl font-bold text-primary">
            {company?.name || 'Palash Rent a Car'}
          </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Rent a Car Anywhere
                    <span className="text-primary block mt-1">Across Nordic</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    {company?.description ||
                        'Premium car rental service with branches in every major city. Flexible options for every journey.'}
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Button size="lg" asChild>
                        <Link to="/cars">
                            Browse Cars
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link to="/locations">View Locations</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
    {
        icon:        MapPin,
        title:       'Multiple Locations',
        description: 'Pick up and drop off at any of our branches across Nordic.',
    },
    {
        icon:        Shield,
        title:       'Fully Insured',
        description: 'All our vehicles come with comprehensive insurance coverage.',
    },
    {
        icon:        Clock,
        title:       'Flexible Rentals',
        description: 'Daily rentals with easy extensions. No hidden fees.',
    },
    {
        icon:        Star,
        title:       'Top Rated',
        description: 'Thousands of happy customers across the country.',
    },
];

function Features() {
    return (
        <section className="py-16 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-10">Why Choose Us</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f) => (
                        <Card key={f.title} className="text-center border-none shadow-none bg-transparent">
                            <CardContent className="pt-6">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <f.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{f.title}</h3>
                                <p className="text-sm text-muted-foreground">{f.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Featured Cars ────────────────────────────────────────────────────────────

function FeaturedCars() {
    const { data: cars, isLoading } = useAllCars({ limit: 6, status: 'available' });

    return (
        <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Browse Cars</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Discover our latest selection of available cars
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/cars">
                            View all
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </div>

                <CarList cars={cars?.slice(0, 6)} isLoading={isLoading} />
            </div>
        </section>
    );
}

// ─── Locations ────────────────────────────────────────────────────────────────

function LocationsSection() {
    const { data: locations, isLoading } = useAllLocations();

    return (
        <section className="py-16 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Our Locations</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            Find us across Nordic
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/locations">
                            View all
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations?.slice(0, 6).map((loc) => (
                            <Card key={loc._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{loc.name}</p>
                                        <p className="text-xs text-muted-foreground">{loc.city}, {loc.country}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to hit the road?</h2>
                <p className="text-muted-foreground mb-8">
                    Create a free account and start renting today.
                    No hidden fees, no surprises.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Button size="lg" asChild>
                        <Link to="/register">
                            Get started
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link to="/about">Learn more</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ company }) {
    return (
        <footer className="border-t py-10 px-4 bg-muted/20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Car className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{company?.name || 'Palash Rent a Car'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {company?.description?.slice(0, 100)}...
                    </p>
                </div>
                <div>
                    <p className="font-medium mb-3">Quick Links</p>
                    <div className="space-y-2">
                        {[
                            { to: '/cars',      label: 'Browse Cars' },
                            { to: '/locations', label: 'Locations' },
                            { to: '/about',     label: 'About Us' },
                            { to: '/login',     label: 'Sign In' },
                        ].map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="font-medium mb-3">Contact</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        {company?.email   && <p>{company.email}</p>}
                        {company?.phone   && <p>{company.phone}</p>}
                        {company?.address && <p>{company.address}</p>}
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} {company?.name || 'Palash Rent a Car'}. All rights reserved.
            </div>
        </footer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
    const { data: company } = useCompany();

    return (
        <div>
            <Hero        company={company} />
            <Features />
            <FeaturedCars />
            <LocationsSection />
            <CTA />
            <Footer      company={company} />
        </div>
    );
}