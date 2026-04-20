import { Link } from 'react-router-dom';
import {
    Car, CalendarRange, Users, BarChart2,
    ArrowRight, CheckCircle, Clock, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerStats }  from '@/hooks/useStats';
import { useAllRentals }    from '@/hooks/useRentals';
import { useAllCars }       from '@/hooks/useCars';
import useAuthStore         from '@/store/authStore';
import { format }           from 'date-fns';

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'bg-primary/10 text-primary' }) {
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
            to:          '/manager/rentals',
            icon:        CalendarRange,
            label:       'Manage Rentals',
            description: 'Approve, activate and process returns',
            bg:          'bg-orange-50 border-orange-100',
            iconBg:      'bg-orange-500/10 text-orange-700 ring-1 ring-orange-100',
        },
        {
            to:          '/manager/cars',
            icon:        Car,
            label:       'Manage Cars',
            description: 'Add, edit or remove cars',
            bg:          'bg-indigo-50 border-indigo-100',
            iconBg:      'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-100',
        },
        {
            to:          '/manager/users',
            icon:        Users,
            label:       'Manage Users',
            description: 'View and lock user accounts',
            bg:          'bg-cyan-50 border-cyan-100',
            iconBg:      'bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-100',
        },
        {
            to:          '/manager/stats',
            icon:        BarChart2,
            label:       'Statistics',
            description: 'View rentals and revenue stats',
            bg:          'bg-emerald-50 border-emerald-100',
            iconBg:      'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action) => (
                <Link
                    key={action.to}
                    to={action.to}
                    className={`p-4 rounded-3xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${action.bg}`}
                >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center mb-3 ${action.iconBg}`}>
                        <action.icon className="h-4 w-4" />
                    </div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </Link>
            ))}
        </div>
    );
}

// ─── Pending Rentals ──────────────────────────────────────────────────────────

function PendingRentals({ rentals, isLoading }) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!rentals?.length) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending rentals — all caught up</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {rentals.slice(0, 5).map((rental) => (
                <div
                    key={rental._id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/20 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                                {rental.car?.manufacturer} {rental.car?.model}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {rental.renter?.name} · {rental.startDate
                                ? format(new Date(rental.startDate), 'dd MMM yyyy')
                                : '—'}
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-2">pending</Badge>
                </div>
            ))}
        </div>
    );
}

// ─── Car Status Overview ──────────────────────────────────────────────────────

function CarStatusOverview({ stats, isLoading }) {
    const statuses = [
        { label: 'Available', key: 'available', color: 'bg-green-500'  },
        { label: 'Rented',    key: 'rented',    color: 'bg-blue-500'   },
        { label: 'Returned',  key: 'returned',  color: 'bg-yellow-500' },
        { label: 'Removed',   key: 'removed',   color: 'bg-gray-400'   },
    ];

    const breakdown = stats?.carStatusBreakdown || [];

    const getCount = (key) =>
        breakdown.find((b) => b._id === key)?.count ?? 0;

    const total = breakdown.reduce((sum, b) => sum + b.count, 0);

    if (isLoading) return <Skeleton className="h-24 w-full" />;

    return (
        <div className="space-y-3">
            {statuses.map((s) => {
                const count = getCount(s.key);
                const pct   = total ? Math.round((count / total) * 100) : 0;
                return (
                    <div key={s.key}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">{s.label}</span>
                            <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full ${s.color} transition-all`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
    const { user }                             = useAuthStore();
    const { data: stats, isLoading: loadingSt } = useManagerStats();
    const { data: pending, isLoading: loadingR } = useAllRentals({ status: 'pending' });
    const { data: cars,    isLoading: loadingC } = useAllCars({ limit: 100 });

    const totalCars      = cars?.length ?? 0;
    const availableCars  = cars?.filter((c) => c.status === 'available').length ?? 0;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">
                    Manager Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Welcome back, {user?.name?.split(' ')[0]}. Here's your overview.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Car}
                    label="Total Cars"
                    value={loadingC ? '—' : totalCars}
                    sub={`${availableCars} available`}
                    color="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                    icon={CalendarRange}
                    label="Total Rentals"
                    value={loadingSt ? '—' : stats?.totalRentals ?? 0}
                    sub="Completed"
                    color="bg-green-500/10 text-green-600"
                />
                <StatCard
                    icon={Clock}
                    label="Pending"
                    value={loadingR ? '—' : pending?.length ?? 0}
                    sub="Awaiting approval"
                    color="bg-yellow-500/10 text-yellow-600"
                />
                <StatCard
                    icon={BarChart2}
                    label="Revenue"
                    value={loadingSt ? '—' : `€${stats?.totalRevenue ?? 0}`}
                    sub="Total earned"
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

                {/* Pending rentals */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            Pending Approvals
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/manager/rentals?status=pending">
                                View all
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <PendingRentals rentals={pending} isLoading={loadingR} />
                    </CardContent>
                </Card>

                {/* Car status overview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            Fleet Overview
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/manager/cars">
                                Manage
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <CarStatusOverview stats={stats} isLoading={loadingSt} />
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}