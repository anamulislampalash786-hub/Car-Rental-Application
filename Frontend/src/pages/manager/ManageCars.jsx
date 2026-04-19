import { useState } from 'react';
import {
    Plus, Search, Pencil, Trash2,
    Loader2, Car, MapPin,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    useAllCars, useCreateCar,
    useUpdateCar, useDeleteCar,
} from '@/hooks/useCars';
import { useAllLocations } from '@/hooks/useLocations';
import { toast }           from 'sonner';
import useAuthStore         from '@/store/authStore';
import { useForm }         from 'react-hook-form';
import { zodResolver }     from '@hookform/resolvers/zod';
import { z }               from 'zod';

// ─── Schema ───────────────────────────────────────────────────────────────────

const carSchema = z.object({
    manufacturer: z.string().min(1, 'Required'),
    model:        z.string().min(1, 'Required'),
    color:        z.string().min(1, 'Required'),
    year:         z.string().min(4, 'Required'),
    transmission: z.string().min(1, 'Required'),
    seats:        z.string().min(1, 'Required'),
    pricePerDay:  z.string().min(1, 'Required'),
    kilometers:   z.string().min(1, 'Required'),
    location:     z.string().min(1, 'Required'),
});

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['all', 'pending', 'available', 'rented', 'returned', 'removed'];

const statusConfig = {
    pending:   { color: 'text-yellow-600 bg-yellow-50', label: 'Pending'   },
    available: { color: 'text-green-600 bg-green-50',  label: 'Available' },
    rented:    { color: 'text-blue-600 bg-blue-50',    label: 'Rented'    },
    returned:  { color: 'text-yellow-600 bg-yellow-50', label: 'Returned'  },
    removed:   { color: 'text-gray-500 bg-gray-100',   label: 'Removed'   },
};

// ─── Car Form Dialog ──────────────────────────────────────────────────────────

function CarFormDialog({ car, trigger }) {
    const [open, setOpen]     = useState(false);
    const [images, setImages] = useState([]);
    const { data: locations } = useAllLocations();

    const { mutate: createCar, isPending: creating } = useCreateCar();
    const { mutate: updateCar, isPending: updating } = useUpdateCar(car?._id);
    const isPending = creating || updating;
    const isEdit    = !!car;

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(carSchema),
        defaultValues: car ? {
            manufacturer: car.manufacturer,
            model:        car.model,
            color:        car.color,
            year:         String(car.year),
            transmission: car.transmission,
            seats:        String(car.seats),
            pricePerDay:  String(car.pricePerDay),
            kilometers:   String(car.kilometers),
            location:     car.location?._id || car.location,
        } : {},
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => formData.append(k, v));
        images.forEach((img) => formData.append('images', img));

        const mutate = isEdit ? updateCar : createCar;
        mutate(formData, {
            onSuccess: () => {
                toast.success(`Car ${isEdit ? 'updated' : 'added'} successfully`);
                reset();
                setImages([]);
                setOpen(false);
            },
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Car' : 'Add New Car'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-1.5">
                            <Label>Manufacturer</Label>
                            <Input placeholder="Toyota" {...register('manufacturer')} />
                            {errors.manufacturer && (
                                <p className="text-xs text-destructive">{errors.manufacturer.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Model</Label>
                            <Input placeholder="Corolla" {...register('model')} />
                            {errors.model && (
                                <p className="text-xs text-destructive">{errors.model.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Color</Label>
                            <Input placeholder="White" {...register('color')} />
                            {errors.color && (
                                <p className="text-xs text-destructive">{errors.color.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Year</Label>
                            <Input type="number" placeholder="2022" {...register('year')} />
                            {errors.year && (
                                <p className="text-xs text-destructive">{errors.year.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Transmission</Label>
                            <Select
                                defaultValue={car?.transmission}
                                onValueChange={(v) => setValue('transmission', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="automatic">Automatic</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.transmission && (
                                <p className="text-xs text-destructive">{errors.transmission.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Seats</Label>
                            <Input type="number" placeholder="5" {...register('seats')} />
                            {errors.seats && (
                                <p className="text-xs text-destructive">{errors.seats.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Price per day (€)</Label>
                            <Input type="number" placeholder="45" {...register('pricePerDay')} />
                            {errors.pricePerDay && (
                                <p className="text-xs text-destructive">{errors.pricePerDay.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Kilometers</Label>
                            <Input type="number" placeholder="32000" {...register('kilometers')} />
                            {errors.kilometers && (
                                <p className="text-xs text-destructive">{errors.kilometers.message}</p>
                            )}
                        </div>

                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <Label>Branch Location</Label>
                        <Select
                            defaultValue={car?.location?._id || car?.location}
                            onValueChange={(v) => setValue('location', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations?.map((loc) => (
                                    <SelectItem key={loc._id} value={loc._id}>
                                        {loc.name} — {loc.city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.location && (
                            <p className="text-xs text-destructive">{errors.location.message}</p>
                        )}
                    </div>

                    {/* Images */}
                    <div className="space-y-1.5">
                        <Label>Images</Label>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setImages(Array.from(e.target.files))}
                        />
                        {images.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {images.length} image(s) selected
                            </p>
                        )}
                        {isEdit && car?.images?.length > 0 && images.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                {car.images.length} existing image(s) — upload new to replace
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {isEdit ? 'Updating...' : 'Adding...'}
                            </>
                        ) : (
                            isEdit ? 'Update Car' : 'Add Car'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Car Item ─────────────────────────────────────────────────────────────────

function CarItem({ car }) {
    const isBoss = useAuthStore((state) => state.isBoss());
    const { mutate: deleteCar, isPending: deleting } = useDeleteCar();
    const { mutate: updateCar, isPending: updating } = useUpdateCar(car._id);

    const config = statusConfig[car.status] || statusConfig.available;

    const handleDelete = () => {
        if (!confirm(`Remove ${car.manufacturer} ${car.model} from listings?`)) return;
        deleteCar(car._id, {
            onSuccess: () => toast.success('Car removed from listings'),
            onError:   (err) => toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    const handleMarkAvailable = () => {
        const formData = new FormData();
        formData.append('status', 'available');
        updateCar(formData, {
            onSuccess: () =>
                toast.success(`${car.manufacturer} ${car.model} is now available`),
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    return (
        <div className="p-4 rounded-xl border bg-card hover:bg-muted/10 transition-colors">
            <div className="flex items-start gap-4">

                {/* Image */}
                <div className="h-20 w-28 rounded-lg bg-muted overflow-hidden shrink-0">
                    {car.images?.[0]?.url ? (
                        <img
                            src={car.images[0].url}
                            alt={`${car.manufacturer} ${car.model}`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-7 w-7 text-muted-foreground opacity-30" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                        <div>
                            <p className="font-semibold text-base">
                                {car.manufacturer} {car.model}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {car.year} · {car.transmission} · {car.seats} seats · {car.color}
                            </p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.color}`}>
              {config.label}
            </span>
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="font-semibold text-primary">
              €{car.pricePerDay}/day
            </span>
                        <span className="text-muted-foreground">
              {car.kilometers?.toLocaleString()} km
            </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
                            {car.location?.name
                                ? `${car.location.name} — ${car.location.city}`
                                : car.location?.city || 'No location'
                            }
            </span>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">

                        {/* Mark available — returned cars only */}
                        {car.status === 'returned' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleMarkAvailable}
                                disabled={updating}
                                className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs"
                            >
                                {updating
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : '✓ Mark Available'
                                }
                            </Button>
                        )}

                        {/* Approve — boss only, pending cars */}
                        {car.status === 'pending' && isBoss && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleMarkAvailable}
                                disabled={updating}
                                className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs"
                            >
                                {updating
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : 'Approve'
                                }
                            </Button>
                        )}

                        {/* Add again — removed cars only */}
                        {car.status === 'removed' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleMarkAvailable}
                                disabled={updating}
                                className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs"
                            >
                                {updating
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : 'Add again'
                                }
                            </Button>
                        )}

                        {/* Edit */}
                        <CarFormDialog
                            car={car}
                            trigger={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs gap-1.5"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                            }
                        />

                        {/* Remove — hide if already removed */}
                        {car.status !== 'removed' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="h-8 text-xs gap-1.5 text-destructive border-red-200 hover:bg-red-50"
                            >
                                {deleting
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <><Trash2 className="h-3.5 w-3.5" />Remove</>
                                }
                            </Button>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageCars() {
    const [search,         setSearch]   = useState('');
    const [statusFilter,   setStatus]   = useState('all');
    const [locationFilter, setLocation] = useState('all');

    const { data: locations } = useAllLocations();

    // ✅ fetch ALL cars for counts — ignore status filter here
    const { data: allCars } = useAllCars({
        ...(locationFilter !== 'all' && { location: locationFilter }),
    });

    // ✅ fetch filtered cars for the list
    const params = {
        ...(statusFilter   !== 'all' && { status:   statusFilter   }),
        ...(locationFilter !== 'all' && { location: locationFilter }),
    };
    const { data: cars, isLoading } = useAllCars(params);

    // client-side search
    const filtered = search
        ? cars?.filter((c) =>
            `${c.manufacturer} ${c.model} ${c.color} ${c.location?.city}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : cars;

    // ✅ counts always from allCars — never affected by status filter
    const counts = {
        all:       allCars?.length ?? 0,
        available: allCars?.filter((c) => c.status === 'available').length ?? 0,
        rented:    allCars?.filter((c) => c.status === 'rented').length    ?? 0,
        returned:  allCars?.filter((c) => c.status === 'returned').length  ?? 0,
        removed:   allCars?.filter((c) => c.status === 'removed').length   ?? 0,
    };

    const activeLocation = locations?.find((l) => l._id === locationFilter);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Manage Cars</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {filtered?.length ?? 0} cars
                        {activeLocation && <span> at {activeLocation.name}</span>}
                        {statusFilter !== 'all' && <span> · {statusFilter}</span>}
                    </p>
                </div>
                <CarFormDialog
                    trigger={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Car
                        </Button>
                    }
                />
            </div>

            {/* Search + Location filter */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by make, model, color or city..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Location dropdown — ✅ no icon inside SelectTrigger */}
                <Select value={locationFilter} onValueChange={setLocation}>
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> All locations
              </span>
                        </SelectItem>
                        {locations?.map((loc) => (
                            <SelectItem key={loc._id} value={loc._id}>
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {loc.name} — {loc.city}
                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Status filter pills — ✅ plain JS array, no 'as const' */}
            <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize flex items-center gap-1.5 ${
                            statusFilter === s
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {s}
                        {counts[s] > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                statusFilter === s
                                    ? 'bg-white/20 text-primary-foreground'
                                    : 'bg-background text-muted-foreground'
                            }`}>
                {counts[s]}
              </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Returned cars notice */}
            {counts.returned > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm">
                    <span className="text-yellow-600 text-base">⚠</span>
                    <p className="text-yellow-800">
            <span className="font-semibold">
              {counts.returned} car{counts.returned > 1 ? 's' : ''}
            </span>
                        {' '}returned and waiting to be marked available.
                    </p>
                    <button
                        onClick={() => setStatus('returned')}
                        className="ml-auto text-xs text-yellow-700 underline underline-offset-2 hover:text-yellow-900 shrink-0"
                    >
                        View
                    </button>
                </div>
            )}

            {/* Cars list */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            ) : filtered?.length === 0 ? (
                <div className="text-center py-16 border rounded-xl text-muted-foreground">
                    <Car className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No cars found</p>
                    <p className="text-sm mt-1">
                        {search ? 'Try a different search term' : 'Try adjusting the filters'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered?.map((car) => (
                        <CarItem key={car._id} car={car} />
                    ))}
                </div>
            )}

        </div>
    );
}