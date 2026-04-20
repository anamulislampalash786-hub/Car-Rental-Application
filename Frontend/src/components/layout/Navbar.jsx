import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useAuthStore from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
const atLeast = (role, min) =>
    ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(min);

export default function Navbar() {
    const { user }    = useAuthStore();
    const isStaff  = user && atLeast(user.role, 'manager');
    const { mutate: logout } = useLogout();

    const publicLinks = [
        { to: '/cars',      label: 'Browse Cars' },
        ...(!isStaff ? [{ to: '/locations', label: 'Locations' }] : []),
        { to: '/about',     label: 'About' },
    ];

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const dashboardPath =
        user?.role === 'admin'   ? '/admin'   :
            user?.role === 'boss'    ? '/boss'    :
                user?.role === 'manager' ? '/manager' : '/dashboard';

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 font-semibold text-lg text-primary group">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-all duration-500 ease-out shadow-xl group-hover:shadow-purple-500/30 animate-pulse">
                        <svg
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Car body - Red gradient */}
                            <path
                                d="M5 11l1.5-4.5h11L19 11M5 11l-1 6h16l-1-6M5 11h14"
                                fill="url(#carBody)"
                                stroke="#dc2626"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Car roof - Blue */}
                            <rect
                                x="5"
                                y="11"
                                width="14"
                                height="3"
                                fill="url(#carRoof)"
                                rx="1"
                            />
                            {/* Windshield - Light blue */}
                            <path
                                d="M8 9l4-2 4 2"
                                fill="#3b82f6"
                                stroke="#1d4ed8"
                                strokeWidth="1"
                                strokeLinecap="round"
                                className="animate-pulse"
                                style={{ animationDelay: '0.5s' }}
                            />
                            {/* Wheels with colorful rims */}
                            <circle
                                cx="7"
                                cy="15"
                                r="2.5"
                                fill="#1f2937"
                                stroke="#374151"
                                strokeWidth="0.5"
                            />
                            <circle
                                cx="7"
                                cy="15"
                                r="1.5"
                                fill="url(#wheel1)"
                                className="animate-spin"
                                style={{ animationDuration: '2s' }}
                            />
                            <circle
                                cx="17"
                                cy="15"
                                r="2.5"
                                fill="#1f2937"
                                stroke="#374151"
                                strokeWidth="0.5"
                            />
                            <circle
                                cx="17"
                                cy="15"
                                r="1.5"
                                fill="url(#wheel2)"
                                className="animate-spin"
                                style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                            />
                            {/* Headlights - Yellow */}
                            <circle
                                cx="4"
                                cy="12"
                                r="0.8"
                                fill="#fbbf24"
                                className="animate-ping"
                                style={{ animationDuration: '1.5s' }}
                            />
                            <circle
                                cx="20"
                                cy="12"
                                r="0.8"
                                fill="#fbbf24"
                                className="animate-ping"
                                style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}
                            />

                            {/* Gradient definitions */}
                            <defs>
                                <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="50%" stopColor="#dc2626" />
                                    <stop offset="100%" stopColor="#b91c1c" />
                                </linearGradient>
                                <linearGradient id="carRoof" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#1d4ed8" />
                                </linearGradient>
                                <radialGradient id="wheel1" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#fbbf24" />
                                    <stop offset="50%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#d97706" />
                                </radialGradient>
                                <radialGradient id="wheel2" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="50%" stopColor="#059669" />
                                    <stop offset="100%" stopColor="#047857" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </span>
                    Palash Rent a Car
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-6">
                    {publicLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer h-9 w-9">
                                    <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to={dashboardPath} className="flex items-center gap-2">
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/dashboard/profile" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="text-destructive focus:text-destructive flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link to="/register">Register</Link>
                            </Button>
                        </>
                    )}

                    {/* Mobile menu */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5 text-primary" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-4 mt-8">
                                {publicLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="text-sm font-medium hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </nav>
    );
}