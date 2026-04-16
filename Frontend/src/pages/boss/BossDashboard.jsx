import { Link } from 'react-router-dom';
import {
    DollarSign, Car, Users, TrendingUp,
    ArrowRight, BarChart2, MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBossStats }  from '@/hooks/useStats';
import { useAllUsers }   from '@/hooks/useUser';
import useAuthStore      from '@/store/authStore';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions() {
    const actions = [
        {
            to:          '/boss/stats',
            icon:        BarChart2,
            label:       'Revenue Stats',
            description: 'View detailed revenue breakdown',
        },
        {
            to:          '/boss/team',
            icon:        Users,
            label:       'Manage Team',
            description: 'Add or remove managers',
        },
        {
            to:          '/boss/locations',
            icon:        MapPin,
            label:       'Locations',
            description: 'Manage branch locations',
        },
        {
            to:          '/manager/cars',
            icon:        Car,
            label:       'Fleet',
            description: 'View and manage all cars',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((a) => (
                <Link
                    key={a.to}
                    to={a.to}
                    className="p-4 rounded-xl border bg-card hover:bg-muted/30 hover:shadow-sm transition-all group"
                >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <a.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-medium text-sm">{a.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                </Link>
            ))}
        </div>
    );
}

// ─── Top Cars ─────────────────────────────────────────────────────────────────

function TopCars({ data, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!data?.length) {
        return (
            <p className="text-sm text-muted-foreground text-center py-6">
                No rental data yet
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {data.slice(0, 5).map((item, i) => (
                <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <span className="text-lg font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {item.car?.manufacturer} {item.car?.model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {item.totalRentals} rentals · {item.totalKm?.toLocaleString()} km
                        </p>
                    </div>
                    <p className="text-sm font-bold text-primary">
                        €{item.totalRevenue?.toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ─── Top Users ────────────────────────────────────────────────────────────────

function TopUsers({ data, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!data?.length) {
        return (
            <p className="text-sm text-muted-foreground text-center py-6">
                No data yet
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {data.slice(0, 5).map((item, i) => {
                const initials = item.user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                return (
                    <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                        <span className="text-lg font-bold text-muted-foreground w-5">{i + 1}</span>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.user?.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {item.totalRentals} rentals · {item.totalKm?.toLocaleString()} km
                            </p>
                        </div>
                        <p className="text-sm font-bold text-primary">
                            €{item.totalSpent?.toLocaleString()}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BossDashboard() {
    const { user }                               = useAuthStore();
    const { data: stats,    isLoading: loadingSt } = useBossStats();
    const { data: managers, isLoading: loadingM  } = useAllUsers({ role: 'manager' });

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">
                    Boss Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Welcome back, {user?.name?.split(' ')[0]}. Company performance overview.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={loadingSt ? '—' : `€${stats?.overview?.totalRevenue?.toLocaleString() ?? 0}`}
                    sub="All time"
                    color="bg-green-500/10 text-green-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total Rentals"
                    value={loadingSt ? '—' : stats?.overview?.totalRentals ?? 0}
                    sub="Completed"
                    color="bg-indigo-500/10 text-indigo-600"
                />
                <StatCard
                    icon={Car}
                    label="Avg Rental Cost"
                    value={loadingSt ? '—' : `€${Math.round(stats?.overview?.avgRentalCost ?? 0)}`}
                    sub="Per rental"
                    color="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                    icon={Users}
                    label="Managers"
                    value={loadingM ? '—' : managers?.length ?? 0}
                    sub="Active staff"
                    color="bg-purple-500/10 text-purple-600"
                />
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
                <QuickActions />
            </div>

            {/* Two column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base font-semibold">Top Performing Cars</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/boss/stats">
                                View all <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <TopCars data={stats?.revenuePerCar} isLoading={loadingSt} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base font-semibold">Top Spending Users</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/boss/stats">
                                View all <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <TopUsers data={stats?.topUsers} isLoading={loadingSt} />
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}