import { useState } from 'react';
import { MapPin, Phone, Mail, Car, Search } from 'lucide-react';
import { Input }  from '@/components/ui/input';
import { Badge }  from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button }   from '@/components/ui/button';
import { Link }     from 'react-router-dom';
import { useAllLocations }      from '@/hooks/useLocations';
import { useCarsAtLocation }    from '@/hooks/useLocations';

// ─── Location Card ────────────────────────────────────────────────────────────

function LocationCard({ location }) {
    const { data, isLoading } = useCarsAtLocation(location._id);
    const availableCars       = data?.cars?.length ?? 0;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{location.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {location.city}, {location.country}
                            </p>
                        </div>
                    </div>
                    <Badge variant={location.isActive ? 'default' : 'secondary'}>
                        {location.isActive ? 'Open' : 'Closed'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500" />
                    <span>{location.address}</span>
                </div>

                {/* Phone */}
                {location.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                        <a href={`tel:${location.phone}`} className="hover:text-foreground transition-colors">
                            {location.phone}
                        </a>
                    </div>
                )}

                {/* Email */}
                {location.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0 text-sky-500" />
                        <a href={`mailto:${location.email}`} className="hover:text-foreground transition-colors">
                            {location.email}
                        </a>
                    </div>
                )}

                {/* Available cars */}
                <div className="pt-2 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-primary" />
                        {isLoading ? (
                            <Skeleton className="h-4 w-20" />
                        ) : (
                            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{availableCars}</span>{' '}
                                cars available
            </span>
                        )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                        <Link to={`/cars?location=${location._id}`}>View Cars</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function LocationSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <div className="pt-2 border-t flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Locations() {
    const [search, setSearch]     = useState('');
    const { data: locations, isLoading } = useAllLocations();

    const filtered = search
        ? locations?.filter((loc) =>
            `${loc.name} ${loc.city} ${loc.country}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : locations;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Our Locations</h1>
                <p className="text-muted-foreground mt-1">
                    Find a Palash Rent a Car branch near you across Nordic
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by city or branch name..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Stats bar */}
            {!isLoading && (
                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{filtered?.length ?? 0}</span>{' '}
              {filtered?.length === 1 ? 'location' : 'locations'} found
          </span>
                    <span>•</span>
                    <span>
            <span className="font-semibold text-foreground">
              {locations?.filter((l) => l.isActive).length ?? 0}
            </span>{' '}
                        currently open
          </span>
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <LocationSkeleton key={i} />
                    ))}
                </div>
            ) : filtered?.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No locations found</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered?.map((location) => (
                        <LocationCard key={location._id} location={location} />
                    ))}
                </div>
            )}

        </div>
    );
}