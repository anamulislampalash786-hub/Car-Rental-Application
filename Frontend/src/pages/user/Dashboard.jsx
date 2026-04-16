import { Link } from 'react-router-dom';
import {
    Car, CalendarRange, MapPin, Clock,
    ArrowRight, TrendingUp, DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyRentals } from '@/hooks/useRentals';
import useAuthStore     from '@/store/authStore';
import { format }       from 'date-fns';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon: Icon }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Status badge variant ─────────────────────────────────────────────────────

const statusVariant = {
    pending:  'secondary',
    approved: 'outline',
    active:   'default',
    returned: 'secondary',
    rejected: 'destructive',
};

// ─── Active Rental Banner ─────────────────────────────────────────────────────

function ActiveRentalBanner({ rental }) {
    if (!rental) return null;

    return (
        <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Active Rental</p>
                        <p className="text-sm text-muted-foreground">
                            {rental.car?.manufacturer} {rental.car?.model} — due{' '}
                            {format(new Date(rental.expectedReturnDate), 'dd MMM yyyy')}
                        </p>
                    </div>
                </div>
                <Badge>active</Badge>
            </CardContent>
        </Card>
    );
}

// ─── Recent Rentals ───────────────────────────────────────────────────────────

function RecentRentals({ rentals, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!rentals?.length) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <CalendarRange className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No rentals yet</p>
                <p className="text-sm mt-1">Browse available cars to get started</p>
                <Button className="mt-4" asChild>
                    <Link to="/cars">Browse Cars</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {rentals.slice(0, 5).map((rental) => (
                <div
                    key={rental._id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {rental.car?.manufacturer} {rental.car?.model}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                    {rental.pickupLocation?.city}
                </span>
                                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                                    {format(new Date(rental.startDate), 'dd MMM yyyy')}
                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold">€{rental.totalCost}</p>
                        <Badge variant={statusVariant[rental.status] || 'secondary'}>
                            {rental.status}
                        </Badge>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions() {
    const actions = [
        {
            to:          '/cars',
            icon:        Car,
            label:       'Browse Cars',
            description: 'Find your next car',
        },
        {
            to:          '/dashboard/rentals',
            icon:        CalendarRange,
            label:       'My Rentals',
            description: 'View rental history',
        },
        {
            to:          '/locations',
            icon:        MapPin,
            label:       'Locations',
            description: 'Find a branch near you',
        },
        {
            to:          '/dashboard/profile',
            icon:        TrendingUp,
            label:       'Profile',
            description: 'Update your details',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action) => (
                <Link
                    key={action.to}
                    to={action.to}
                    className="p-4 rounded-xl border bg-card hover:bg-muted/30 hover:shadow-sm transition-all group"
                >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </Link>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { user }                         = useAuthStore();
    const { data, isLoading }              = useMyRentals();

    const rentals      = data?.rentals     || [];
    const stats        = data?.stats       || {};
    const activeRental = rentals.find((r) => r.status === 'active');
    const pendingCount = rentals.filter((r) => r.status === 'pending').length;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome back, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Here's what's happening with your account
                    </p>
                </div>
                <Button asChild>
                    <Link to="/cars">
                        Rent a Car
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </div>

            {/* Active rental banner */}
            {activeRental && <ActiveRentalBanner rental={activeRental} />}

            {/* Pending rentals notice */}
            {pendingCount > 0 && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm">
                            You have{' '}
                            <span className="font-semibold">{pendingCount} pending</span>{' '}
                            rental {pendingCount === 1 ? 'request' : 'requests'} awaiting manager approval.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Total Rentals"
                    value={isLoading ? '—' : stats.totalRentals ?? 0}
                    subtitle="Completed rentals"
                    icon={CalendarRange}
                />
                <StatCard
                    title="Total Spent"
                    value={isLoading ? '—' : `€${stats.totalSpent ?? 0}`}
                    subtitle="Across all rentals"
                    icon={DollarSign}
                />
                <StatCard
                    title="KM Driven"
                    value={isLoading ? '—' : `${stats.totalKm?.toLocaleString() ?? 0} km`}
                    subtitle="Total distance"
                    icon={TrendingUp}
                />
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <QuickActions />
            </div>

            {/* Recent rentals */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold">Recent Rentals</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard/rentals">
                            View all
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <RecentRentals rentals={rentals} isLoading={isLoading} />
                </CardContent>
            </Card>

        </div>
    );
}