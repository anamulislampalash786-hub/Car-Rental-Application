import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Car, TrendingUp, Users } from 'lucide-react';
import { useBossStats } from '@/hooks/useStats';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899'];

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

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-background border rounded-lg shadow-md p-3 text-sm">
            <p className="font-medium mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {prefix}{p.value?.toLocaleString()}{suffix}
                </p>
            ))}
        </div>
    );
}

// ─── Revenue Per Location Chart ───────────────────────────────────────────────

function RevenuePerLocationChart({ data }) {
    const formatted = data?.map((d) => ({
        name:    d.location?.city || 'Unknown',
        revenue: d.totalRevenue,
        rentals: d.totalRentals,
    })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Revenue by Location</CardTitle>
            </CardHeader>
            <CardContent>
                {!formatted.length ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `€${v}`}
                            />
                            <Tooltip content={<CustomTooltip prefix="€" />} />
                            <Bar dataKey="revenue" radius={[4,4,0,0]} name="Revenue">
                                {formatted.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Yearly Revenue Chart ─────────────────────────────────────────────────────

function YearlyRevenueChart({ data }) {
    const formatted = data?.map((d) => ({
        year:    String(d._id.year),
        revenue: d.totalRevenue,
        rentals: d.totalRentals,
    })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Yearly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
                {!formatted.length ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="year"
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `€${v}`}
                            />
                            <Tooltip content={<CustomTooltip prefix="€" />} />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ fill: '#6366f1', r: 4 }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Revenue Per Car Table ────────────────────────────────────────────────────

function RevenuePerCarTable({ data }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Revenue Per Car</CardTitle>
            </CardHeader>
            <CardContent>
                {!data?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                ) : (
                    <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground px-3 py-2">
                            <span className="col-span-2">Car</span>
                            <span className="text-center">Rentals</span>
                            <span className="text-right">Revenue</span>
                        </div>
                        {data.map((item, i) => (
                            <div
                                key={item._id}
                                className="grid grid-cols-4 items-center px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors text-sm"
                            >
                                <div className="col-span-2 min-w-0">
                                    <p className="font-medium truncate">
                                        {item.car?.manufacturer} {item.car?.model}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.car?.year} · {item.totalKm?.toLocaleString()} km
                                    </p>
                                </div>
                                <span className="text-center text-muted-foreground">
                  {item.totalRentals}
                </span>
                                <span className="text-right font-bold text-primary">
                  €{item.totalRevenue?.toLocaleString()}
                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Top Users Table ──────────────────────────────────────────────────────────

function TopUsersTable({ data }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Top Spending Users</CardTitle>
            </CardHeader>
            <CardContent>
                {!data?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                ) : (
                    <div className="space-y-3">
                        {data.map((item, i) => {
                            const initials = item.user?.name
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase();

                            return (
                                <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                                    <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.user?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.totalRentals} rentals · {item.totalKm?.toLocaleString()} km
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-primary shrink-0">
                                        €{item.totalSpent?.toLocaleString()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StatsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BossStats() {
    const { data: stats, isLoading } = useBossStats();

    if (isLoading) return <StatsSkeleton />;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Revenue Statistics</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Company-wide financial performance
                </p>
            </div>

            {/* Overview stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`€${stats?.overview?.totalRevenue?.toLocaleString() ?? 0}`}
                    sub="All time"
                    color="bg-green-500/10 text-green-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total Rentals"
                    value={stats?.overview?.totalRentals ?? 0}
                    sub="Completed"
                    color="bg-indigo-500/10 text-indigo-600"
                />
                <StatCard
                    icon={Car}
                    label="Total KM"
                    value={`${stats?.overview?.totalKm?.toLocaleString() ?? 0}`}
                    sub="Driven by customers"
                    color="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                    icon={Users}
                    label="Avg Cost"
                    value={`€${Math.round(stats?.overview?.avgCost ?? 0)}`}
                    sub="Per rental"
                    color="bg-purple-500/10 text-purple-600"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenuePerLocationChart data={stats?.revenuePerLocation} />
                <YearlyRevenueChart      data={stats?.yearlyRevenue} />
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenuePerCarTable data={stats?.revenuePerCar} />
                <TopUsersTable      data={stats?.topUsers} />
            </div>

        </div>
    );
}