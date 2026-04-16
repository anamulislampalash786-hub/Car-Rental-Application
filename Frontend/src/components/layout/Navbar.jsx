import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, LogOut, User, LayoutDashboard } from 'lucide-react';
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
                <Link to="/" className="flex items-center gap-3 font-semibold text-lg text-primary">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Car className="h-5 w-5" />
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