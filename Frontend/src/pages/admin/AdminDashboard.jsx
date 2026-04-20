import { Link } from 'react-router-dom';
import {
    Users, Car, MapPin, Building2,
    ShieldCheck, TrendingUp, DollarSign,
    ArrowRight, CalendarRange,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStats } from '@/hooks/useStats';
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
            to:          '/admin/users',
            icon:        Users,
            label:       'All Users',
            description: 'View and manage all users',
            bg:          'bg-sky-50 border-sky-100',
            iconBg:      'bg-sky-500/10 text-sky-700 ring-1 ring-sky-100',
        },
        {
            to:          '/admin/company',
            icon:        Building2,
            label:       'Company Info',
            description: 'Update company details',
            bg:          'bg-violet-50 border-violet-100',
            iconBg:      'bg-violet-500/10 text-violet-700 ring-1 ring-violet-100',
        },
        {
            to:          '/boss/team',
            icon:        ShieldCheck,
            label:       'Team',
            description: 'Manage managers and bosses',
            bg:          'bg-emerald-50 border-emerald-100',
            iconBg:      'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-100',
        },
        {
            to:          '/boss/locations',
            icon:        MapPin,
            label:       'Locations',
            description: 'Manage branch locations',
            bg:          'bg-orange-50 border-orange-100',
            iconBg:      'bg-orange-500/10 text-orange-700 ring-1 ring-orange-100',
        },
        {
            to:          '/manager/cars',
            icon:        Car,
            label:       'Fleet',
            description: 'Manage all cars',
            bg:          'bg-indigo-50 border-indigo-100',
            iconBg:      'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-100',
        },
        {
            to:          '/manager/rentals',
            icon:        CalendarRange,
            label:       'Rentals',
            description: 'View all rentals',
            bg:          'bg-rose-50 border-rose-100',
            iconBg:      'bg-rose-500/10 text-rose-700 ring-1 ring-rose-100',
        },
        {
            to:          '/boss/stats',
            icon:        TrendingUp,
            label:       'Revenue',
            description: 'Revenue statistics',
            bg:          'bg-amber-50 border-amber-100',
            iconBg:      'bg-amber-500/10 text-amber-700 ring-1 ring-amber-100',
        },
        {
            to:          '/manager/stats',
            icon:        DollarSign,
            label:       'Stats',
            description: 'Operational statistics',
            bg:          'bg-teal-50 border-teal-100',
            iconBg:      'bg-teal-500/10 text-teal-700 ring-1 ring-teal-100',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {actions.map((a) => (
                <Link
                    key={a.to}
                    to={a.to}
                    className={`p-4 rounded-3xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${a.bg}`}
                >
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center mb-3 ${a.iconBg}`}>
                        <a.icon className="h-4 w-4" />
                    </div>
                    <p className="font-medium text-sm">{a.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                </Link>
            ))}
        </div>
    );
}

// ─── Role Breakdown ───────────────────────────────────────────────────────────

function RoleBreakdown({ data, isLoading }) {
    const roleColor = {
        user:    'bg-gray-400',
        manager: 'bg-blue-500',
        boss:    'bg-purple-500',
        admin:   'bg-red-500',
    };

    const total = data?.reduce((s, d) => s + d.count, 0) || 0;

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data?.map((d) => {
                const pct = total ? Math.round((d.count / total) * 100) : 0;
                return (
                    <div key={d._id}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-muted-foreground">{d._id}</span>
                            <span className="font-medium">{d.count} <span className="text-muted-foreground">({pct}%)</span></span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${roleColor[d._id] || 'bg-primary'}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── New Users Chart ──────────────────────────────────────────────────────────

function NewUsersChart({ data, isLoading }) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (isLoading) return <Skeleton className="h-32 w-full" />;

    if (!data?.length) {
        return (
            <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
        );
    }

    const max = Math.max(...data.map((d) => d.count));

    return (
        <div className="flex items-end gap-1.5 h-32">
            {data.map((d, i) => {
                const height = max ? (d.count / max) * 100 : 0;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full">
                            <div
                                className="w-full bg-primary/80 rounded-t-sm transition-all group-hover:bg-primary"
                                style={{ height: `${Math.max(height, 4)}px` }}
                            />
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background border rounded px-1 py-0.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {d.count}
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
              {months[d._id.month - 1]?.slice(0, 3)}
            </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const { user }                               = useAuthStore();
    const { data: stats, isLoading: loadingSt }  = useAdminStats();

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
                    </div>
                    <h1 className="text-2xl font-bold">System Overview</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Welcome back, {user?.name?.split(' ')[0]}. Full system access.
                    </p>
                </div>
            </div>

            {/* System counts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { icon: Users,        label: 'Users',          key: 'totalUsers',     color: 'bg-blue-500/10 text-blue-600'   },
                    { icon: Car,          label: 'Cars',           key: 'totalCars',      color: 'bg-indigo-500/10 text-indigo-600'},
                    { icon: CalendarRange,label: 'Rentals',        key: 'totalRentals',   color: 'bg-green-500/10 text-green-600' },
                    { icon: MapPin,       label: 'Locations',      key: 'totalLocations', color: 'bg-orange-500/10 text-orange-600'},
                    { icon: ShieldCheck,  label: 'Locked Users',   key: 'lockedUsers',    color: 'bg-red-500/10 text-red-600'     },
                    { icon: TrendingUp,   label: 'Active Rentals', key: 'activeRentals',  color: 'bg-yellow-500/10 text-yellow-600'},
                ].map((item) => (
                    <Card key={item.key}>
                        <CardContent className="p-4">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-3 ${item.color}`}>
                                <item.icon className="h-4 w-4" />
                            </div>
                            <p className="text-2xl font-bold">
                                {loadingSt ? '—' : stats?.counts?.[item.key] ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Revenue highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={loadingSt ? '—' : `€${stats?.revenue?.totalRevenue?.toLocaleString() ?? 0}`}
                    sub="All time"
                    color="bg-green-500/10 text-green-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Rental Cost"
                    value={loadingSt ? '—' : `€${Math.round(stats?.revenue?.avgRentalCost ?? 0)}`}
                    sub="Per rental"
                    color="bg-indigo-500/10 text-indigo-600"
                />
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-base font-semibold mb-4">System Actions</h2>
                <QuickActions />
            </div>

            {/* Two column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Role breakdown */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Users by Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RoleBreakdown
                            data={stats?.userRoleBreakdown}
                            isLoading={loadingSt}
                        />
                    </CardContent>
                </Card>

                {/* New users trend */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">New Users (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NewUsersChart
                            data={stats?.newUsersMonthly}
                            isLoading={loadingSt}
                        />
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}