import { useEffect, useState } from 'react';
import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import { z }            from 'zod';
import { useNavigate }  from 'react-router-dom';
import {
    User, Mail, Phone, Save, Loader2,
    Lock, AlertTriangle, Eye, EyeOff,
} from 'lucide-react';
import {
    Card, CardContent, CardHeader,
    CardTitle, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import { Button }    from '@/components/ui/button';
import { Badge }     from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton }  from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMe, useUpdateMe, useUnregister } from '@/hooks/useUser';
import { useUpdatePassword }                 from '@/hooks/useAuth';
import useAuthStore                          from '@/store/authStore';
import { toast }                             from 'sonner';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
    email: z.string().email('Invalid email'),
    phone: z.string().min(6, 'Invalid phone number'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Required'),
    password:        z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
});

// ─── Password Field ───────────────────────────────────────────────────────────

function PasswordInput({ label, error, ...props }) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="relative">
                <Input type={show ? 'text' : 'password'} className="pr-10" {...props} />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    {show
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye    className="h-4 w-4" />
                    }
                </button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

// ─── Change Password Dialog ───────────────────────────────────────────────────

function ChangePasswordDialog() {
    const [open, setOpen]                        = useState(false);
    const { mutate: updatePassword, isPending }  = useUpdatePassword();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(passwordSchema) });

    const onSubmit = ({ confirmPassword, ...data }) => {
        updatePassword(data, {
            onSuccess: () => {
                toast.success('Password updated successfully');
                reset();
                setOpen(false);
            },
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Failed to update password'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Lock className="h-3.5 w-3.5 mr-2" />
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <PasswordInput
                        label="Current Password"
                        error={errors.currentPassword?.message}
                        placeholder="••••••••"
                        {...register('currentPassword')}
                    />
                    <PasswordInput
                        label="New Password"
                        error={errors.password?.message}
                        placeholder="••••••••"
                        {...register('password')}
                    />
                    <PasswordInput
                        label="Confirm New Password"
                        error={errors.confirmPassword?.message}
                        placeholder="••••••••"
                        {...register('confirmPassword')}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending
                            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                            : 'Update Password'
                        }
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Unregister Dialog ────────────────────────────────────────────────────────

function UnregisterDialog() {
    const [open, setOpen]                      = useState(false);
    const [confirm, setConfirm]                = useState('');
    const { mutate: unregister, isPending }    = useUnregister();
    const { clearAuth }                        = useAuthStore();
    const navigate                             = useNavigate();

    const handleUnregister = () => {
        if (confirm !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }
        unregister(undefined, {
            onSuccess: () => {
                clearAuth();
                toast.success('Account deleted');
                navigate('/');
            },
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Unregister
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Account
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive space-y-1">
                        <p className="font-semibold">This action cannot be undone.</p>
                        <p>All your data including rental history will be permanently removed.</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Type <span className="font-bold">DELETE</span> to confirm</Label>
                        <Input
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="DELETE"
                        />
                    </div>
                    <Button
                        variant="destructive"
                        className="w-full"
                        disabled={confirm !== 'DELETE' || isPending}
                        onClick={handleUnregister}
                    >
                        {isPending
                            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
                            : 'Permanently Delete Account'
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Profile() {
    const { data: user, isLoading } = useMe();
    const { mutate: updateMe, isPending } = useUpdateMe();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(profileSchema),
    });

    // populate form when user loads
    useEffect(() => {
        if (user) {
            reset({
                email: user.email,
                phone: user.phone || '',
            });
        }
    }, [user, reset]);

    const onSubmit = (data) => {
        updateMe(data, {
            onSuccess: () => toast.success('Profile updated successfully'),
            onError:   (err) =>
                toast.error(err.response?.data?.message || 'Failed to update profile'),
        });
    };

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const roleColor = {
        user:    'bg-gray-100 text-gray-700',
        manager: 'bg-blue-100 text-blue-700',
        boss:    'bg-purple-100 text-purple-700',
        admin:   'bg-red-100 text-red-700',
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Account Settings</h1>
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${roleColor[user?.role] || roleColor.user}`}>
          {user?.role}
        </span>
            </div>

            {/* Profile card */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">{user?.name}</CardTitle>
                        <CardDescription className="mt-0.5">
                            Member since{' '}
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                                    month: 'long', year: 'numeric',
                                })
                                : '—'}
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4 pt-6">

                        {/* Name — read only */}
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name
                                <span className="text-xs text-muted-foreground ml-1">(permanent)</span>
                            </Label>
                            <Input value={user?.name || ''} disabled className="bg-muted/50" />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
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

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+358 40 123 4567"
                                {...register('phone')}
                            />
                            {errors.phone && (
                                <p className="text-xs text-destructive">{errors.phone.message}</p>
                            )}
                        </div>

                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t bg-muted/30 py-4 flex-wrap gap-3">
                        <ChangePasswordDialog />
                        <Button type="submit" disabled={!isDirty || isPending}>
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                            ) : (
                                <><Save className="h-4 w-4 mr-2" />Save Changes</>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Account info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID</span>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
              {user?._id?.slice(-8).toUpperCase()}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Account status</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            user?.isLocked
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                        }`}>
              {user?.isLocked ? 'Locked' : 'Active'}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColor[user?.role] || roleColor.user}`}>
              {user?.role}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Joined</span>
                        <span>
              {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                  })
                  : '—'}
            </span>
                    </div>
                </CardContent>
            </Card>

            {/* Danger zone */}
            <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm font-medium">Delete Account</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Permanently removes all your data including rental history.
                        </p>
                    </div>
                    <UnregisterDialog />
                </CardContent>
            </Card>

        </div>
    );
}