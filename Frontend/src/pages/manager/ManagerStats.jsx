import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Car, CalendarRange, DollarSign } from 'lucide-react';
import { useManagerStats } from '@/hooks/useStats';

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

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

// ─── Monthly Revenue Chart ────────────────────────────────────────────────────

function MonthlyRevenueChart({ data }) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const formatted = data?.map((d) => ({
        month:   months[d._id.month - 1],
        revenue: d.revenue,
        rentals: d.totalRentals,
    })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
                {!formatted.length ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        No data available yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="month"
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
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Rental Trend Chart ───────────────────────────────────────────────────────

function RentalTrendChart({ data }) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const formatted = data?.map((d) => ({
        month:   months[d._id.month - 1],
        rentals: d.totalRentals,
    })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Rental Trend</CardTitle>
            </CardHeader>
            <CardContent>
                {!formatted.length ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        No data available yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip suffix=" rentals" />} />
                            <Line
                                type="monotone"
                                dataKey="rentals"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ fill: '#6366f1', r: 4 }}
                                name="Rentals"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Car Status Pie ───────────────────────────────────────────────────────────

function CarStatusPie({ data }) {
    const formatted = data?.map((d) => ({
        name:  d._id,
        value: d.count,
    })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Fleet Status</CardTitle>
            </CardHeader>
            <CardContent>
                {!formatted.length ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={formatted}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {formatted.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(val, name) => [`${val} cars`, name]}
                            />
                            <Legend
                                formatter={(value) => (
                                    <span className="text-xs capitalize text-muted-foreground">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Rental Status Breakdown ──────────────────────────────────────────────────

function RentalStatusBreakdown({ data }) {
    const total = data?.reduce((sum, d) => sum + d.count, 0) || 0;

    const statusColor = {
        pending:  'bg-yellow-500',
        approved: 'bg-blue-500',
        active:   'bg-green-500',
        returned: 'bg-gray-400',
        rejected: 'bg-red-500',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Rental Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {!data?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No data</p>
                ) : (
                    data.map((d) => {
                        const pct = total ? Math.round((d.count / total) * 100) : 0;
                        return (
                            <div key={d._id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize text-muted-foreground">{d._id}</span>
                                    <span className="font-medium">{d.count} <span className="text-muted-foreground">({pct}%)</span></span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${statusColor[d._id] || 'bg-primary'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}

// ─── Most Rented Cars ─────────────────────────────────────────────────────────

function MostRentedCars({ data }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Most Rented Cars</CardTitle>
            </CardHeader>
            <CardContent>
                {!data?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                ) : (
                    <div className="space-y-3">
                        {data.map((item, i) => (
                            <div key={item._id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground w-6">
                  {i + 1}
                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {item.car?.manufacturer} {item.car?.model} {item.car?.year}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.totalRentals} rentals · {item.totalKm?.toLocaleString()} km
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-primary shrink-0">
                                    €{item.totalRevenue?.toLocaleString()}
                                </p>
                            </div>
                        ))}
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

export default function ManagerStats() {
    const { data: stats, isLoading } = useManagerStats();

    if (isLoading) return <StatsSkeleton />;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Statistics</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Fleet and rental performance overview
                </p>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={CalendarRange}
                    label="Total Rentals"
                    value={stats?.totalRentals ?? 0}
                    sub="Completed"
                    color="bg-indigo-500/10 text-indigo-600"
                />
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`€${stats?.totalRevenue?.toLocaleString() ?? 0}`}
                    sub="All time"
                    color="bg-green-500/10 text-green-600"
                />
                <StatCard
                    icon={Car}
                    label="Fleet Size"
                    value={stats?.carStatusBreakdown?.reduce((s, d) => s + d.count, 0) ?? 0}
                    sub="Total cars"
                    color="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Active Now"
                    value={stats?.statusBreakdown?.find((s) => s._id === 'active')?.count ?? 0}
                    sub="Currently rented"
                    color="bg-yellow-500/10 text-yellow-600"
                />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyRevenueChart data={stats?.monthlyRevenue} />
                <RentalTrendChart    data={stats?.monthlyRevenue} />
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CarStatusPie             data={stats?.carStatusBreakdown} />
                <RentalStatusBreakdown    data={stats?.statusBreakdown} />
            </div>

            {/* Most rented */}
            <MostRentedCars data={stats?.mostRentedCars} />

        </div>
    );
}