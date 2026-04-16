import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Users, Calendar, Fuel,
    Star, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCar, useAddReview }         from '@/hooks/useCars';
import { useAllLocations }              from '@/hooks/useLocations';
import { useRequestRental }             from '@/hooks/useRentals';
import useAuthStore                     from '@/store/authStore';
import { toast }                        from 'sonner';
import { format, addDays }              from 'date-fns';
import { useForm }                      from 'react-hook-form';
import { zodResolver }                  from '@hookform/resolvers/zod';
import { z }                            from 'zod';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const rentalSchema = z.object({
    pickupLocationId:   z.string().min(1, 'Please select a pickup location'),
    startDate:          z.string().min(1, 'Please select a start date'),
    expectedReturnDate: z.string().min(1, 'Please select a return date'),
}).refine((d) => new Date(d.expectedReturnDate) > new Date(d.startDate), {
    message: 'Return date must be after start date',
    path:    ['expectedReturnDate'],
});

const reviewSchema = z.object({
    rating:  z.string().min(1, 'Please select a rating'),
    comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images }) {
    const [current, setCurrent] = useState(0);

    if (!images?.length) {
        return (
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                No images available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                <img
                    src={images[current].url}
                    alt={`Car image ${current + 1}`}
                    className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrent((c) => (c + 1) % images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`h-1.5 rounded-full transition-all ${
                                        i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-colors ${
                                i === current ? 'border-primary' : 'border-transparent'
                            }`}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Rental Dialog ────────────────────────────────────────────────────────────

function RentalDialog({ car }) {
    const [open, setOpen]                    = useState(false);
    const { user }                           = useAuthStore();
    const navigate                           = useNavigate();
    const { mutate: request, isPending }     = useRequestRental();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(rentalSchema),
        defaultValues: {
            // ✅ pre-set pickup location to car's location
            pickupLocationId: car.location?._id || '',
        },
    });

    // set it on mount in case defaultValues doesn't catch it
    useEffect(() => {
        if (car.location?._id) {
            setValue('pickupLocationId', car.location._id);
        }
    }, [car.location, setValue]);

    const startDate = watch('startDate');
    const today     = format(new Date(), 'yyyy-MM-dd');

    const calcDays = () => {
        const s = watch('startDate');
        const e = watch('expectedReturnDate');
        if (!s || !e) return null;
        const days = Math.ceil((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    };

    const days      = calcDays();
    const totalCost = days ? days * car.pricePerDay : null;

    const onSubmit = (data) => {
        request(
            { ...data, carId: car._id },
            {
                onSuccess: () => {
                    toast.success('Rental request submitted', {
                        description: 'Awaiting manager approval.',
                    });
                    setOpen(false);
                    navigate('/dashboard/rentals');
                },
                onError: (err) => {
                    toast.error(err.response?.data?.message || 'Failed to submit rental request');
                },
            }
        );
    };

    if (!user) {
        return (
            <Button className="w-full" size="lg" asChild>
                <Link to="/login">Login to Rent</Link>
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="w-full"
                    size="lg"
                    disabled={car.status !== 'available'}
                >
                    {car.status === 'available' ? 'Rent This Car' : `Car is ${car.status}`}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Rent {car.manufacturer} {car.model}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

                    {/* ✅ Pickup location — locked to car's location */}
                    <div className="space-y-1.5">
                        <Label>Pickup Location</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <div>
                                <p className="text-sm font-medium">{car.location?.name}</p>
                                <p className="text-xs text-muted-foreground">{car.location?.city}</p>
                            </div>
                            <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border">
                Fixed
              </span>
                        </div>
                        {/* hidden input so form still submits the value */}
                        <input type="hidden" {...register('pickupLocationId')} />
                        {errors.pickupLocationId && (
                            <p className="text-xs text-destructive">{errors.pickupLocationId.message}</p>
                        )}
                    </div>

                    {/* Start date */}
                    <div className="space-y-1.5">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            min={today}
                            {...register('startDate')}
                        />
                        {errors.startDate && (
                            <p className="text-xs text-destructive">{errors.startDate.message}</p>
                        )}
                    </div>

                    {/* Return date */}
                    <div className="space-y-1.5">
                        <Label>Expected Return Date</Label>
                        <Input
                            type="date"
                            min={startDate || today}
                            {...register('expectedReturnDate')}
                        />
                        {errors.expectedReturnDate && (
                            <p className="text-xs text-destructive">{errors.expectedReturnDate.message}</p>
                        )}
                    </div>

                    {/* Cost preview */}
                    {totalCost && (
                        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                <span className="text-muted-foreground">
                  €{car.pricePerDay} × {days} {days === 1 ? 'day' : 'days'}
                </span>
                                <span className="font-semibold">€{totalCost}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                                <span>Estimated total</span>
                                <span>€{totalCost}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Final cost calculated on return based on actual days
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Rental Request'
                        )}
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Review Form ──────────────────────────────────────────────────────────────

function ReviewForm({ carId }) {
    const [open, setOpen]              = useState(false);
    const { mutate: addReview, isPending } = useAddReview(carId);

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
                onError: (err) => {
                    toast.error(err.response?.data?.message || 'Failed to submit review');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

                    <div className="space-y-1.5">
                        <Label>Rating</Label>
                        <Select onValueChange={(val) => setValue('rating', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                                {[5, 4, 3, 2, 1].map((r) => (
                                    <SelectItem key={r} value={String(r)}>
                                        {'⭐'.repeat(r)} — {r}/5
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
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Reviews List ─────────────────────────────────────────────────────────────

function ReviewsList({ reviews }) {
    if (!reviews?.length) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reviews yet — be the first to review</p>
            </div>
        );
    }

    const avgRating = (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);

    return (
        <div className="space-y-4">
            {/* Average */}
            <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{avgRating}</span>
                <div>
                    <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${
                                    i < Math.round(avgRating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-muted-foreground'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Individual reviews */}
            <div className="space-y-4">
                {reviews.map((review, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                    {review.user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium">
                  {review.user?.name || 'Anonymous'}
                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <Star
                                        key={j}
                                        className={`h-3.5 w-3.5 ${
                                            j < review.rating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-muted-foreground'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground pl-9">{review.comment}</p>
                        <p className="text-xs text-muted-foreground pl-9">
                            {format(new Date(review.createdAt), 'dd MMM yyyy')}
                        </p>
                        {i < reviews.length - 1 && <Separator className="mt-3" />}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CarDetail() {
    const { id }      = useParams();
    const { user }    = useAuthStore();
    const { data: car, isLoading } = useCar(id);

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 text-center">
                <p className="text-muted-foreground">Car not found.</p>
                <Button asChild className="mt-4">
                    <Link to="/cars">Back to Cars</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">

            {/* Back */}
            <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
                <Link to="/cars">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cars
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left column ─────────────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Gallery */}
                    <ImageGallery images={car.images} />

                    {/* Title + status */}
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-2xl font-bold">
                                {car.manufacturer} {car.model}
                            </h1>
                            <Badge variant={car.status === 'available' ? 'default' : 'secondary'}>
                                {car.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{car.location?.name} — {car.location?.city}</span>
                        </div>
                    </div>

                    {/* Specs */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { icon: Calendar, label: 'Year',         value: car.year },
                                    { icon: Fuel,     label: 'Transmission', value: car.transmission },
                                    { icon: Users,    label: 'Seats',        value: `${car.seats} seats` },
                                    { icon: MapPin,   label: 'Color',        value: car.color },
                                    { icon: Calendar, label: 'Kilometers',   value: `${car.kilometers?.toLocaleString()} km` },
                                    { icon: MapPin,   label: 'Location',     value: car.location?.city },
                                ].map((spec) => (
                                    <div key={spec.label} className="space-y-1">
                                        <p className="text-xs text-muted-foreground">{spec.label}</p>
                                        <p className="text-sm font-medium capitalize">{spec.value}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Reviews</CardTitle>
                            {user && <ReviewForm carId={car._id} />}
                        </CardHeader>
                        <CardContent>
                            <ReviewsList reviews={car.reviews} />
                        </CardContent>
                    </Card>

                </div>

                {/* ── Right column — booking card ──────────────────────────────────── */}
                <div className="space-y-4">
                    <Card className="sticky top-24">
                        <CardContent className="p-6 space-y-4">

                            {/* Price */}
                            <div>
                                <p className="text-3xl font-bold">€{car.pricePerDay}</p>
                                <p className="text-sm text-muted-foreground">per day</p>
                            </div>

                            <Separator />

                            {/* Quick specs */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Transmission</span>
                                    <span className="font-medium capitalize">{car.transmission}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Seats</span>
                                    <span className="font-medium">{car.seats}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Year</span>
                                    <span className="font-medium">{car.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Kilometers</span>
                                    <span className="font-medium">{car.kilometers?.toLocaleString()} km</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Rent button */}
                            <RentalDialog car={car} />

                            {/* Location info */}
                            {car.location && (
                                <div className="text-xs text-muted-foreground text-center space-y-0.5">
                                    <p className="flex items-center justify-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {car.location.name}
                                    </p>
                                    <p>{car.location.address}</p>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}