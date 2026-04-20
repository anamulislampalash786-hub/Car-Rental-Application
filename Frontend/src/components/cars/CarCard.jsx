import { Link } from 'react-router-dom';
import { MapPin, Users, Fuel, Calendar } from 'lucide-react';
import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function CarCard({ car }) {
    return (
        <Card className="overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer border-2 hover:border-primary/50">
            {/* Image */}
            <div className="aspect-video bg-muted relative overflow-hidden">
                {car.images?.[0]?.url ? (
                    <img
                        src={car.images[0].url}
                        alt={`${car.manufacturer} ${car.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-gradient-to-br from-muted to-muted/50">
                        No image
                    </div>
                )}
                <Badge
                    className="absolute top-2 right-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground"
                    variant={car.status === 'available' ? 'default' : 'secondary'}
                >
                    {car.status}
                </Badge>
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <CardContent className="p-4 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-transparent">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-base transition-colors duration-300 group-hover:text-primary">
                            {car.manufacturer} {car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-primary/70">{car.year}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg transition-all duration-300 group-hover:text-primary group-hover:scale-105">€{car.pricePerDay}</p>
                        <p className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-primary/70">per day</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 transition-all duration-300 group-hover:scale-105">
                        <Users className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110" />
                        {car.seats} seats
                    </span>
                    <span className="flex items-center gap-1.5 transition-all duration-300 group-hover:scale-105">
                        <Fuel className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 capitalize" />
                        {car.transmission}
                    </span>
                    <span className="flex items-center gap-1.5 transition-all duration-300 group-hover:scale-105">
                        <Calendar className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110" />
                        {car.kilometers?.toLocaleString()} km
                    </span>
                    <span className="flex items-center gap-1.5 transition-all duration-300 group-hover:scale-105">
                        <MapPin className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110" />
                        {car.location?.city || 'N/A'}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    asChild
                    className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 group-hover:bg-primary group-hover:hover:bg-primary/90"
                    size="sm"
                >
                    <Link to={`/cars/${car._id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}