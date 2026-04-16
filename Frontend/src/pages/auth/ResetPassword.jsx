import { useState }     from 'react';
import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import { z }            from 'zod';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Car, Loader2, Eye, EyeOff }    from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useResetPassword } from '@/hooks/useAuth';
import { toast }            from 'sonner';

const schema = z.object({
    password:        z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
});

export default function ResetPassword() {
    const { token }    = useParams();
    const navigate     = useNavigate();
    const [show, setShow] = useState(false);
    const { mutate: resetPassword, isPending } = useResetPassword(token);

    const { register, handleSubmit, formState: { errors } } =
        useForm({ resolver: zodResolver(schema) });

    const onSubmit = ({ password }) => {
        resetPassword({ password }, {
            onSuccess: () => {
                toast.success('Password reset successfully');
                navigate('/login');
            },
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Reset failed or link expired'),
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
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>Enter your new password below</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={show ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pr-10"
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    >
                                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending
                                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Resetting...</>
                                    : 'Reset Password'
                                }
                            </Button>
                        </form>
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