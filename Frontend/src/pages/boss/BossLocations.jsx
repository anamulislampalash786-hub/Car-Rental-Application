import { useState } from 'react';
import { MapPin, Phone, Mail, Plus, Pencil, ToggleLeft, Loader2, Search } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    useAllLocations, useCreateLocation,
    useUpdateLocation, useDeactivateLocation,
} from '@/hooks/useLocations';
import { toast }   from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ─── Schema ───────────────────────────────────────────────────────────────────

const locationSchema = z.object({
    name:    z.string().min(1, 'Required'),
    city:    z.string().min(1, 'Required'),
    country: z.string().min(1, 'Required'),
    address: z.string().min(1, 'Required'),
    phone:   z.string().optional(),
    email:   z.string().email('Invalid email').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
});

// ─── Location Form Dialog ─────────────────────────────────────────────────────

function LocationFormDialog({ location, trigger }) {
    const [open, setOpen] = useState(false);
    const isEdit = !!location;

    const { mutate: create, isPending: creating } = useCreateLocation();
    const { mutate: update, isPending: updating } = useUpdateLocation(location?._id);
    const isPending = creating || updating;

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(locationSchema),
        defaultValues: location ? {
            name:     location.name,
            city:     location.city,
            country:  location.country,
            address:  location.address,
            phone:    location.phone || '',
            email:    location.email || '',
            isActive: location.isActive,
        } : { country: 'Finland', isActive: true },
    });

    const onSubmit = (data) => {
        const mutate = isEdit ? update : create;
        mutate(data, {
            onSuccess: () => {
                toast.success(`Location ${isEdit ? 'updated' : 'created'} successfully`);
                reset();
                setOpen(false);
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Location' : 'Add Location'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1.5">
                            <Label>Branch Name</Label>
                            <Input placeholder="Helsinki Airport Branch" {...register('name')} />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>City</Label>
                            <Input placeholder="Helsinki" {...register('city')} />
                            {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Country</Label>
                            <Input placeholder="Finland" {...register('country')} />
                            {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <Label>Address</Label>
                            <Input placeholder="Street address" {...register('address')} />
                            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Phone</Label>
                            <Input placeholder="+358 9 123 4567" {...register('phone')} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email</Label>
                            <Input placeholder="branch@nordiccars.fi" {...register('email')} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <input
                                id="isActive"
                                type="checkbox"
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                {...register('isActive')}
                            />
                            <label htmlFor="isActive" className="text-sm text-muted-foreground">
                                Keep location active
                            </label>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending
                            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEdit ? 'Updating...' : 'Creating...'}</>
                            : isEdit ? 'Update Location' : 'Create Location'
                        }
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Location Card ────────────────────────────────────────────────────────────

function LocationCard({ location }) {
    const { mutate: update, isPending: updating } = useUpdateLocation(location._id);
    const { mutate: deactivate, isPending: deactivating } = useDeactivateLocation();

    const handleDeactivate = () => {
        if (!location.isActive) return;
        if (!confirm(`Deactivate ${location.name}?`)) return;
        deactivate(location._id, {
            onSuccess: () => toast.success('Location deactivated'),
            onError:   (err) => toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    const handleActivate = () => {
        update({ isActive: true }, {
            onSuccess: () => toast.success('Location activated'),
            onError:   (err) => toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    return (
        <div className={`p-4 rounded-xl border bg-card transition-colors ${!location.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4 flex-wrap">

                {/* Icon */}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{location.name}</p>
                        <Badge variant={location.isActive ? 'default' : 'secondary'}>
                            {location.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{location.city}, {location.country}</p>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        {location.phone && (
                            <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />{location.phone}
              </span>
                        )}
                        {location.email && (
                            <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />{location.email}
              </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <LocationFormDialog
                        location={location}
                        trigger={
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        }
                    />
                    {location.isActive ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeactivate}
                            disabled={deactivating}
                            className="text-destructive border-red-200 hover:bg-red-50"
                        >
                            {deactivating
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <><ToggleLeft className="h-3.5 w-3.5 mr-1.5" />Deactivate</>
                            }
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleActivate}
                            disabled={updating}
                        >
                            {updating
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <><ToggleLeft className="h-3.5 w-3.5 mr-1.5" />Activate</>
                            }
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BossLocations() {
    const [search, setSearch]              = useState('');
    const { data: locations, isLoading }   = useAllLocations();

    const filtered = search
        ? locations?.filter((l) =>
            `${l.name} ${l.city}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : locations;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Locations</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {locations?.length ?? 0} branches total ·{' '}
                        {locations?.filter((l) => l.isActive).length ?? 0} active
                    </p>
                </div>
                <LocationFormDialog
                    trigger={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Location
                        </Button>
                    }
                />
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search locations..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                </div>
            ) : filtered?.length === 0 ? (
                <div className="text-center py-16 border rounded-xl text-muted-foreground">
                    <MapPin className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No locations found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered?.map((loc) => (
                        <LocationCard key={loc._id} location={loc} />
                    ))}
                </div>
            )}

        </div>
    );
}