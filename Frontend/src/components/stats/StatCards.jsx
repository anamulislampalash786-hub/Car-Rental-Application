import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatsCard({ title, value, subtitle, icon: Icon, className }) {
    return (
        <Card className={cn('', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    {Icon && (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}