import { Link } from 'react-router-dom';
import { MapPin, Users, Fuel, Calendar } from 'lucide-react';
import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function CarCard({ car }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="aspect-video bg-muted relative overflow-hidden">
                {car.images?.[0]?.url ? (
                    <img
                        src={car.images[0].url}
                        alt={`${car.manufacturer} ${car.model}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                    </div>
                )}
                <Badge
                    className="absolute top-2 right-2"
                    variant={car.status === 'available' ? 'default' : 'secondary'}
                >
                    {car.status}
                </Badge>
            </div>

            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-base">
                            {car.manufacturer} {car.model}
                        </h3>
                        <p className="text-sm text-muted-foreground">{car.year}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">€{car.pricePerDay}</p>
                        <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary" />
              {car.seats} seats
          </span>
                    <span className="flex items-center gap-1.5">
            <Fuel className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary capitalize" />
                        {car.transmission}
          </span>
                    <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary" />
                        {car.kilometers?.toLocaleString()} km
          </span>
                    <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary" />
                        {car.location?.city || 'N/A'}
          </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full" size="sm">
                    <Link to={`/cars/${car._id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}