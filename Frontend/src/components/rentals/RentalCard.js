import { Badge }  from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarRange, MapPin, Car, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const statusVariant = {
    pending:  'secondary',
    approved: 'outline',
    active:   'default',
    returned: 'secondary',
    rejected: 'destructive',
};

export default function RentalCard({ rental }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <p className="font-semibold">
                            {rental.car?.manufacturer} {rental.car?.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {rental.renter?.name || 'You'}
                        </p>
                    </div>
                    <Badge variant={statusVariant[rental.status] || 'secondary'}>
                        {rental.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarRange className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary" />
              {format(new Date(rental.startDate), 'dd MMM yyyy')}
          </span>
                    <span className="flex items-center gap-1.5">
            <CalendarRange className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary" />
                        {format(new Date(rental.expectedReturnDate), 'dd MMM yyyy')}
          </span>
                    <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary" />
                        {rental.pickupLocation?.city || 'N/A'}
          </span>
                    <span className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 rounded-full bg-primary/10 p-1 text-primary" />
            €{rental.totalCost}
          </span>
                </div>
            </CardContent>
        </Card>
    );
}