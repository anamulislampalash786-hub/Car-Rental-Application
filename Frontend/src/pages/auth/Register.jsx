import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Loader2 } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@/hooks/useAuth';
import { toast }       from 'sonner';

const registerSchema = z.object({
    name:            z.string().min(2, 'Name must be at least 2 characters'),
    email:           z.string().email('Please enter a valid email'),
    phone:           z.string().min(6, 'Please enter a valid phone number'),
    password:        z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
});

export default function Register() {
    const navigate = useNavigate();
    const { mutate: register, isPending } = useRegister();

    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(registerSchema) });

    const onSubmit = ({ confirmPassword, ...data }) => {
        register(data, {
            onError: (err) => {
                toast.error(err.response?.data?.message || 'Registration failed');
            },
        });
        navigate('/login');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-fuchsia-500 to-amber-400 p-2 shadow-lg shadow-cyan-500/20 animate-pulse">
                        <Car className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold">Palash Rent a Car</span>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>Create an account</CardTitle>
                        <CardDescription>
                            Register to start renting cars across Nordic
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    placeholder="Jarus Thapa"
                                    {...formRegister('name')}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...formRegister('email')}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">Phone number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+358 40 123 4567"
                                    {...formRegister('phone')}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...formRegister('password')}
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword">Confirm password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...formRegister('confirmPassword')}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </Button>

                        </form>
                    </CardContent>

                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}