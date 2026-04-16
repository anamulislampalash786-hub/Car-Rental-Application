import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { useEffect } from 'react';
import { toast }     from 'sonner';

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];

export default function ProtectedRoute({ children, minRole = 'user' }) {
    const { user, clearAuth } = useAuthStore();

    // not logged in
    if (!user) return <Navigate to="/login" replace />;

    // ✅ locked user — clear auth and redirect to login
    if (user.isLocked) {
        return <LockedScreen clearAuth={clearAuth} />;
    }

    // insufficient role
    const userLevel = ROLE_HIERARCHY.indexOf(user.role);
    const minLevel  = ROLE_HIERARCHY.indexOf(minRole);
    if (userLevel < minLevel) return <Navigate to="/dashboard" replace />;

    return children;
}

// ─── Locked Screen ────────────────────────────────────────────────────────────

function LockedScreen({ clearAuth }) {
    const navigate = useNavigate();

    useEffect(() => {
        toast.error('Your account has been locked. Please contact support.', {
            duration: 8000,
        });
    }, []);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full text-center space-y-6">

                {/* Icon */}
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <span className="text-4xl">🔒</span>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-destructive">Account Locked</h1>
                    <p className="text-muted-foreground">
                        Your account has been locked by an administrator.
                        You cannot access the platform until your account is unlocked.
                    </p>
                </div>

                {/* Contact info */}
                <div className="p-4 rounded-xl bg-muted/50 border text-sm space-y-1">
                    <p className="font-medium">Need help?</p>
                    <p className="text-muted-foreground">
                        Contact our support team to resolve this issue.
                    </p>
                    <a href="mailto:info@nordiccars.fi"
                    className="text-primary hover:underline block mt-1"
                    >
                    info@nordiccars.fi
                    </a>
                </div>

            {/* Logout button */}
            <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
            >
                <LogOut className="h-4 w-4 mr-2" />
                Back to Login
            </Button>
        </div>
    </div>
);
}