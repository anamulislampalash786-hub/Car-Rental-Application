import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import { z }            from 'zod';
import { Link }         from 'react-router-dom';
import { Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPassword } from '@/hooks/useAuth';
import { toast }             from 'sonner';

const schema = z.object({
    email: z.string().email('Please enter a valid email'),
});

export default function ForgotPassword() {
    const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

    const { register, handleSubmit, formState: { errors } } =
        useForm({ resolver: zodResolver(schema) });

    const onSubmit = ({ email }) => {
        forgotPassword({ email }, {
            onSuccess: () => toast.success('Reset link sent — check your email'),
            onError:   (err) => toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-fuchsia-500 to-amber-400 p-2 shadow-lg shadow-cyan-500/20 animate-pulse">
                        <Car className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold">Palash Rent a Car</span>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>
                            Enter your email and we'll send you a reset link
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isSuccess ? (
                            <div className="text-center py-4 space-y-2">
                                <p className="text-2xl">📧</p>
                                <p className="font-medium">Check your email</p>
                                <p className="text-sm text-muted-foreground">
                                    We sent a password reset link to your email address.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">{errors.email.message}</p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending
                                        ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                                        : 'Send Reset Link'
                                    }
                                </Button>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="justify-center">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                            ← Back to login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}