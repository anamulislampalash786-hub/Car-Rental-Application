import { useState }      from 'react';
import { Link }          from 'react-router-dom';
import {
    Car, CalendarRange, Clock, DollarSign,
    MapPin, ArrowRight, Star, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label }    from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useMyRentals }          from '@/hooks/useRentals';
import { useAddReview, useCar }  from '@/hooks/useCars';
import useAuthStore              from '@/store/authStore';
import { toast }                 from 'sonner';
import { format }                from 'date-fns';
import { useForm }               from 'react-hook-form';
import { zodResolver }           from '@hookform/resolvers/zod';
import { z }                     from 'zod';

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig = {
    pending:  { color: 'text-yellow-600 bg-yellow-50', label: 'Pending'  },
    approved: { color: 'text-blue-600 bg-blue-50',     label: 'Approved' },
    active:   { color: 'text-green-600 bg-green-50',   label: 'Active'   },
    returned: { color: 'text-gray-600 bg-gray-50',     label: 'Returned' },
    rejected: { color: 'text-red-600 bg-red-50',       label: 'Rejected' },
};

// ─── Review schema ────────────────────────────────────────────────────────────

const reviewSchema = z.object({
    rating:  z.string().min(1, 'Please select a rating'),
    comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

// ─── Review Dialog ────────────────────────────────────────────────────────────

function ReviewDialog({ rental }) {
    const [open, setOpen]                  = useState(false);
    const { user }                         = useAuthStore();
    const { mutate: addReview, isPending } = useAddReview(rental.car?._id);
    const { data: car }                    = useCar(rental.car?._id);

    const alreadyReviewed = car?.reviews?.some(
        (r) => r.user?._id === user?._id || r.user === user?._id
    );

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(reviewSchema) });

    const onSubmit = (data) => {
        addReview(
            { ...data, rating: Number(data.rating) },
            {
                onSuccess: () => {
                    toast.success('Review submitted successfully');
                    reset();
                    setOpen(false);
                },
                onError: (err) =>
                    toast.error(err.response?.data?.message || 'Failed to submit review'),
            }
        );
    };

    if (alreadyReviewed) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                Review submitted
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                    <Star className="h-3.5 w-3.5" />
                    Write Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Review {rental.car?.manufacturer} {rental.car?.model}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

                    <div className="space-y-1.5">
                        <Label>Rating</Label>
                        <Select onValueChange={(val) => setValue('rating', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a rating" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    { value: '5', label: '⭐⭐⭐⭐⭐ — Excellent' },
                                    { value: '4', label: '⭐⭐⭐⭐ — Good'      },
                                    { value: '3', label: '⭐⭐⭐ — Average'     },
                                    { value: '2', label: '⭐⭐ — Poor'          },
                                    { value: '1', label: '⭐ — Terrible'        },
                                ].map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.rating && (
                            <p className="text-xs text-destructive">{errors.rating.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Comment</Label>
                        <Textarea
                            placeholder="Share your experience with this car..."
                            rows={4}
                            {...register('comment')}
                        />
                        {errors.comment && (
                            <p className="text-xs text-destructive">{errors.comment.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Rental Item ──────────────────────────────────────────────────────────────

function RentalItem({ rental }) {
    const config = statusConfig[rental.status] || statusConfig.pending;

    return (
        <div className="p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">

            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Car className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">
                            {rental.car?.manufacturer} {rental.car?.model}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {rental.pickupLocation?.city || 'N/A'}
                            {rental.returnLocation?.city &&
                                rental.returnLocation?.city !== rental.pickupLocation?.city && (
                                    <>
                                        <ArrowRight className="h-3 w-3" />
                                        {rental.returnLocation.city}
                                    </>
                                )}
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}>
          {config.label}
        </span>
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Start date</p>
                    <p className="text-sm font-medium">
                        {rental.startDate
                            ? format(new Date(rental.startDate), 'dd MMM yyyy')
                            : '—'}
                    </p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Return date</p>
                    <p className="text-sm font-medium">
                        {rental.expectedReturnDate
                            ? format(new Date(rental.expectedReturnDate), 'dd MMM yyyy')
                            : '—'}
                    </p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Price/day</p>
                    <p className="text-sm font-medium">€{rental.pricePerDay ?? '—'}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Total cost</p>
                    <p className="text-sm font-bold text-primary">
                        €{rental.totalCost?.toFixed(2) ?? '—'}
                    </p>
                </div>
            </div>

            {/* Returned — km + review */}
            {rental.status === 'returned' && (
                <div className="flex items-center justify-between pt-3 border-t flex-wrap gap-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {rental.kmDriven > 0 && (
                            <span>🛣 {rental.kmDriven?.toLocaleString()} km driven</span>
                        )}
                        {rental.actualReturnDate && (
                            <span>
                Returned {format(new Date(rental.actualReturnDate), 'dd MMM yyyy')}
              </span>
                        )}
                        {rental.approvedBy?.name && (
                            <span>Approved by {rental.approvedBy.name}</span>
                        )}
                    </div>
                    {/* ✅ review button */}
                    <ReviewDialog rental={rental} />
                </div>
            )}

            {/* Active — km info */}
            {rental.status === 'active' && (
                <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Currently active
          </span>
                    {rental.actualPickupDate && (
                        <span>
              Picked up {format(new Date(rental.actualPickupDate), 'dd MMM yyyy')}
            </span>
                    )}
                </div>
            )}

            {/* Approved — waiting for pickup */}
            {rental.status === 'approved' && (
                <div className="pt-3 border-t">
                    <p className="text-xs text-blue-600 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Approved — visit the branch to pick up your car
                    </p>
                </div>
            )}

            {/* Pending */}
            {rental.status === 'pending' && (
                <div className="pt-3 border-t">
                    <p className="text-xs text-yellow-600 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Waiting for manager approval
                    </p>
                </div>
            )}

            {/* Rejected */}
            {rental.status === 'rejected' && (
                <div className="pt-3 border-t space-y-2">
                    <p className="text-xs text-muted-foreground">
                        Your request was not approved. You may submit a new rental request.
                    </p>
                    <Button size="sm" variant="outline" asChild>
                        <Link to="/cars">Browse Cars</Link>
                    </Button>
                </div>
            )}

        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RentalSkeleton() {
    return (
        <div className="p-4 rounded-xl border space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Status legend ────────────────────────────────────────────────────────────

const legends = [
    { status: 'pending',  desc: 'Waiting for manager approval'  },
    { status: 'approved', desc: 'Approved — ready for pickup'    },
    { status: 'active',   desc: 'Car currently in use'           },
    { status: 'returned', desc: 'Rental completed'               },
    { status: 'rejected', desc: 'Request was not approved'       },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyRentals() {
    const { data, isLoading, error } = useMyRentals();

    const rentals = data?.rentals || [];
    const stats   = data?.stats   || {};

    const active  = rentals.filter((r) => r.status === 'active');
    const pending = rentals.filter((r) => r.status === 'pending');

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-destructive">Failed to load rentals. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Rentals</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        All your rental requests and history
                    </p>
                </div>
                <Button asChild>
                    <Link to="/cars">
                        Rent a Car
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                    icon={CalendarRange}
                    label="Total Rentals"
                    value={isLoading ? '—' : stats.totalRentals ?? 0}
                    sub="Completed"
                />
                <StatCard
                    icon={DollarSign}
                    label="Total Spent"
                    value={isLoading ? '—' : `€${stats.totalSpent ?? 0}`}
                    sub="All time"
                />
                <StatCard
                    icon={Car}
                    label="KM Driven"
                    value={isLoading ? '—' : `${(stats.totalKm ?? 0).toLocaleString()}`}
                    sub="Total distance"
                />
                <StatCard
                    icon={Clock}
                    label="Pending"
                    value={isLoading ? '—' : pending.length}
                    sub="Awaiting approval"
                />
            </div>

            {/* Active rental highlight */}
            {active.length > 0 && (
                <div>
                    <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Active Rental
                    </h2>
                    <div className="space-y-3">
                        {active.map((r) => <RentalItem key={r._id} rental={r} />)}
                    </div>
                </div>
            )}

            {/* All rentals */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold">All Rentals</h2>
                    <span className="text-sm text-muted-foreground">
            {rentals.length} total
          </span>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <RentalSkeleton key={i} />
                        ))}
                    </div>
                ) : rentals.length === 0 ? (
                    <div className="text-center py-16 border rounded-xl text-muted-foreground">
                        <Car className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No rentals yet</p>
                        <p className="text-sm mt-1">Start by browsing available cars</p>
                        <Button className="mt-4" asChild>
                            <Link to="/cars">Browse Cars</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rentals.map((rental) => (
                            <RentalItem key={rental._id} rental={rental} />
                        ))}
                    </div>
                )}
            </div>

            {/* Status legend */}
            <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Rental Status Guide</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {legends.map((l) => {
                            const config = statusConfig[l.status];
                            return (
                                <div key={l.status} className="flex items-center gap-2 text-sm">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                    {config.label}
                  </span>
                                    <span className="text-muted-foreground">{l.desc}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}