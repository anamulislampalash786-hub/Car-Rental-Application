import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import CarList       from '@/components/cars/CarList';
import { useAllCars }       from '@/hooks/useCars';
import { useAllLocations }  from '@/hooks/useLocations';

// ─── Filter State ─────────────────────────────────────────────────────────────

const defaultFilters = {
    search:       '',
    transmission: '',
    location:     '',
    seats:        '',
    sort:         '-createdAt',
};

// ─── Filter Panel (shared between desktop sidebar and mobile sheet) ────────────

function FilterPanel({ filters, setFilters, locations, onReset, activeCount }) {
    return (
        <div className="space-y-6">

            {/* Transmission */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Transmission</p>
                <div className="flex gap-2 flex-wrap">
                    {['automatic', 'manual'].map((t) => (
                        <Badge
                            key={t}
                            variant={filters.transmission === t ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() =>
                                setFilters((f) => ({
                                    ...f,
                                    transmission: f.transmission === t ? '' : t,
                                }))
                            }
                        >
                            {t}
                        </Badge>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Seats */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Seats</p>
                <div className="flex gap-2 flex-wrap">
                    {['2', '4', '5', '7', '8'].map((s) => (
                        <Badge
                            key={s}
                            variant={filters.seats === s ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() =>
                                setFilters((f) => ({ ...f, seats: f.seats === s ? '' : s }))
                            }
                        >
                            {s}+
                        </Badge>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Location</p>
                <Select
                    value={filters.location}
                    onValueChange={(val) =>
                        setFilters((f) => ({ ...f, location: val === 'all' ? '' : val }))
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All locations</SelectItem>
                        {locations?.map((loc) => (
                            <SelectItem key={loc._id} value={loc._id}>
                                {loc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {/* Reset */}
            {activeCount > 0 && (
                <Button variant="outline" className="w-full" onClick={onReset}>
                    <X className="h-4 w-4 mr-2" />
                    Clear filters ({activeCount})
                </Button>
            )}

        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Cars() {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({...defaultFilters, location: searchParams.get('location') || '',});
    const { data: locations } = useAllLocations();

    // build query params from filters
    const params = {
        ...(filters.transmission && { transmission: filters.transmission }),
        ...(filters.location     && { location:     filters.location }),
        ...(filters.seats        && { seats:        filters.seats }),
        sort: filters.sort,
    };

    const { data: cars, isLoading } = useAllCars(params);

    // client-side search filter
    const filtered = filters.search
        ? cars?.filter((car) =>
            `${car.manufacturer} ${car.model} ${car.color}`
                .toLowerCase()
                .includes(filters.search.toLowerCase())
        )
        : cars;

    // count active filters (exclude search and sort)
    const activeCount = [
        filters.transmission,
        filters.location,
        filters.seats,
    ].filter(Boolean).length;

    const onReset = () => setFilters(defaultFilters);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Browse Cars</h1>
                <p className="text-muted-foreground mt-1">
                    {isLoading ? 'Loading...' : `${filtered?.length ?? 0} cars available`}
                </p>
            </div>

            {/* Search + Sort bar */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by make, model or color..."
                        className="pl-9"
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    />
                </div>

                {/* Sort */}
                <Select
                    value={filters.sort}
                    onValueChange={(val) => setFilters((f) => ({ ...f, sort: val }))}
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-createdAt">Newest first</SelectItem>
                        <SelectItem value="createdAt">Oldest first</SelectItem>
                        <SelectItem value="pricePerDay">Price: low to high</SelectItem>
                        <SelectItem value="-pricePerDay">Price: high to low</SelectItem>
                        <SelectItem value="year">Year: oldest</SelectItem>
                        <SelectItem value="-year">Year: newest</SelectItem>
                    </SelectContent>
                </Select>

                {/* Mobile filter trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden relative">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                            {activeCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeCount}
                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <FilterPanel
                            filters={filters}
                            setFilters={setFilters}
                            locations={locations}
                            onReset={onReset}
                            activeCount={activeCount}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex gap-8">

                {/* Desktop sidebar filters */}
                <aside className="hidden lg:block w-56 shrink-0">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-semibold text-sm">Filters</p>
                                {activeCount > 0 && (
                                    <Badge variant="secondary">{activeCount} active</Badge>
                                )}
                            </div>
                            <FilterPanel
                                filters={filters}
                                setFilters={setFilters}
                                locations={locations}
                                onReset={onReset}
                                activeCount={activeCount}
                            />
                        </CardContent>
                    </Card>
                </aside>

                {/* Car grid */}
                <div className="flex-1">

                    {/* Active filter tags */}
                    {activeCount > 0 && (
                        <div className="flex gap-2 flex-wrap mb-4">
                            {filters.transmission && (
                                <Badge variant="secondary" className="gap-1 pr-1">
                                    {filters.transmission}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFilters((f) => ({ ...f, transmission: '' }));
                                        }}
                                        className="ml-1 hover:text-destructive transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.seats && (
                                <Badge variant="secondary" className="gap-1 pr-1">
                                    {filters.seats}+ seats
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFilters((f) => ({ ...f, seats: '' }));
                                        }}
                                        className="ml-1 hover:text-destructive transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.location && (
                                <Badge variant="secondary" className="gap-1 pr-1">
                                    {locations?.find((l) => l._id === filters.location)?.city || 'Location'}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFilters((f) => ({ ...f, location: '' }));
                                        }}
                                        className="ml-1 hover:text-destructive transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>
                    )}
                    <CarList cars={filtered} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}