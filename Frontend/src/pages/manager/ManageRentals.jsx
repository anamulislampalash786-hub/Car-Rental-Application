import { useState } from 'react';
import { Car, MapPin, Clock, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { useAllRentals, useProcessRental, useActivateRental, useReturnCar } from '@/hooks/useRentals';
import { useAllLocations } from '@/hooks/useLocations';
import { toast }  from 'sonner';
import { format } from 'date-fns';
import { z }      from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig = {
    pending:  { color: 'text-yellow-600 bg-yellow-50', label: 'Pending'  },
    approved: { color: 'text-blue-600 bg-blue-50',     label: 'Approved' },
    active:   { color: 'text-green-600 bg-green-50',   label: 'Active'   },
    returned: { color: 'text-gray-600 bg-gray-50',     label: 'Returned' },
    rejected: { color: 'text-red-600 bg-red-50',       label: 'Rejected' },
};

// ─── Return Dialog ────────────────────────────────────────────────────────────

const returnSchema = z.object({
    returnLocationId: z.string().min(1, 'Select return location'),
    kmAtReturn:       z.string().min(1, 'Enter km at return'),
});

function ReturnDialog({ rental }) {
    const [open, setOpen]                  = useState(false);
    const { data: locations }              = useAllLocations();
    const { mutate: returnCar, isPending } = useReturnCar();

    const { register, handleSubmit, setValue, formState: { errors } } =
        useForm({ resolver: zodResolver(returnSchema) });

    const onSubmit = (data) => {
        returnCar(
            {
                id:   rental._id,
                data: { returnLocationId: data.returnLocationId, kmAtReturn: Number(data.kmAtReturn) },
            },
            {
                onSuccess: () => {
                    toast.success('Car returned successfully');
                    setOpen(false);
                },
                onError: (err) => toast.error(err.response?.data?.message || 'Return failed'),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">Process Return</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Process Car Return</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                        <Label>Return Location</Label>
                        <Select onValueChange={(val) => setValue('returnLocationId', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select return location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations?.map((loc) => (
                                    <SelectItem key={loc._id} value={loc._id}>
                                        {loc.name} — {loc.city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.returnLocationId && (
                            <p className="text-xs text-destructive">{errors.returnLocationId.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Current Kilometers</Label>
                        <Input
                            type="number"
                            placeholder={`Was ${rental.kmAtPickup?.toLocaleString()} km at pickup`}
                            {...register('kmAtReturn')}
                        />
                        {errors.kmAtReturn && (
                            <p className="text-xs text-destructive">{errors.kmAtReturn.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                        ) : 'Confirm Return'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Rental Card ──────────────────────────────────────────────────────────────

function RentalCard({ rental }) {
    const { mutate: process,  isPending: processing  } = useProcessRental();
    const { mutate: activate, isPending: activating   } = useActivateRental();
    const config = statusConfig[rental.status] || statusConfig.pending;

    const handleProcess = (action) => {
        process(
            { id: rental._id, action },
            {
                onSuccess: () => toast.success(`Rental ${action}d successfully`),
                onError:   (err) => toast.error(err.response?.data?.message || 'Action failed'),
            }
        );
    };

    const handleActivate = () => {
        activate(rental._id, {
            onSuccess: () => toast.success('Rental activated — car handed over'),
            onError:   (err) => toast.error(err.response?.data?.message || 'Activation failed'),
        });
    };

    return (
        <div className="p-4 rounded-xl border bg-card hover:bg-muted/10 transition-colors space-y-4">

            {/* Top */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Car className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">
                            {rental.car?.manufacturer} {rental.car?.model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Renter: {rental.renter?.name} · {rental.renter?.phone}
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}>
          {config.label}
        </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Start date</p>
                    <p className="font-medium">
                        {rental.startDate
                            ? format(new Date(rental.startDate), 'dd MMM yyyy')
                            : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Return date</p>
                    <p className="font-medium">
                        {rental.expectedReturnDate
                            ? format(new Date(rental.expectedReturnDate), 'dd MMM yyyy')
                            : '—'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {rental.pickupLocation?.city || '—'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Total cost</p>
                    <p className="font-bold text-primary">€{rental.totalCost}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
                {rental.status === 'pending' && (
                    <>
                        <Button
                            size="sm"
                            onClick={() => handleProcess('approve')}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                                <><CheckCircle className="h-3.5 w-3.5 mr-1" />Approve</>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleProcess('reject')}
                            disabled={processing}
                        >
                            {processing ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                                <><XCircle className="h-3.5 w-3.5 mr-1" />Reject</>
                            )}
                        </Button>
                    </>
                )}

                {rental.status === 'approved' && (
                    <Button
                        size="sm"
                        onClick={handleActivate}
                        disabled={activating}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {activating ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                            <><ArrowRight className="h-3.5 w-3.5 mr-1" />Hand Over Keys</>
                        )}
                    </Button>
                )}

                {rental.status === 'active' && (
                    <ReturnDialog rental={rental} />
                )}

                {rental.status === 'returned' && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        Returned · {rental.kmDriven} km driven · €{rental.totalCost}
                    </div>
                )}
            </div>

        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageRentals() {
    const [statusFilter, setStatusFilter] = useState('all');

    // ✅ always fetch all rentals for counts
    const { data: allRentals } = useAllRentals({});

    // ✅ fetch filtered rentals for the list
    const params = statusFilter !== 'all' ? { status: statusFilter } : {};
    const { data: rentals, isLoading } = useAllRentals(params);

    // ✅ counts always from allRentals — never affected by filter
    const counts = {
        all:      allRentals?.length ?? 0,
        pending:  allRentals?.filter((r) => r.status === 'pending').length  ?? 0,
        approved: allRentals?.filter((r) => r.status === 'approved').length ?? 0,
        active:   allRentals?.filter((r) => r.status === 'active').length   ?? 0,
        returned: allRentals?.filter((r) => r.status === 'returned').length ?? 0,
        rejected: allRentals?.filter((r) => r.status === 'rejected').length ?? 0,
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Manage Rentals</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Approve, activate and process car returns
                </p>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'approved', 'active', 'returned', 'rejected'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                            statusFilter === s
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {s}
                        {counts[s] > 0 && (
                            <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            ) : rentals?.length === 0 ? (
                <div className="text-center py-16 border rounded-xl text-muted-foreground">
                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No rentals found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rentals?.map((rental) => (
                        <RentalCard key={rental._id} rental={rental} />
                    ))}
                </div>
            )}

        </div>
    );
}