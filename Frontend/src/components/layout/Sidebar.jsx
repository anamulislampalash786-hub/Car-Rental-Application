import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Car, CalendarRange, User,
    BarChart2, Users, MapPin, Building2,
    ShieldCheck, DollarSign,
} from 'lucide-react';
import { cn }           from '@/lib/utils';
import useAuthStore     from '@/store/authStore';

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
const atLeast = (userRole, minRole) =>
    ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minRole);

export default function Sidebar() {
    const { user } = useAuthStore();
    if (!user) return null;

    const isAdmin   = user.role === 'admin';
    const isBoss    = atLeast(user.role, 'boss');
    const isManager = atLeast(user.role, 'manager');
    const isUser    = user.role === 'user';

    // dashboard path based on role
    const dashboardPath =
        isAdmin              ? '/admin'   :
            user.role === 'boss' ? '/boss'    :
                isManager            ? '/manager' : '/dashboard';

    return (
        <aside className="w-60 min-h-[calc(100vh-64px)] border-r bg-background p-4 shrink-0">

            {/* ── My Account — hidden for admin ─────────────────────────────────── */}
            {!isAdmin && (
                <NavSection title="My Account">
                    <NavItem to={dashboardPath}       icon={LayoutDashboard} label="Dashboard" />
                    {/* My Rentals only for regular users */}
                    {isUser && (
                        <NavItem to="/dashboard/rentals" icon={CalendarRange}   label="My Rentals" />
                    )}
                    <NavItem to="/dashboard/profile"  icon={User}            label="Profile" />
                </NavSection>
            )}

            {/* ── Management — manager and above ────────────────────────────────── */}
            {isManager && !isAdmin && (
                <NavSection title="Management">
                    <NavItem to="/manager"          icon={LayoutDashboard} label="Overview"  />
                    <NavItem to="/manager/cars"     icon={Car}             label="Cars"       />
                    <NavItem to="/manager/rentals"  icon={CalendarRange}   label="Rentals"    />
                    <NavItem to="/manager/users"    icon={Users}           label="Users"      />
                    <NavItem to="/manager/stats"    icon={BarChart2}       label="Statistics" />
                </NavSection>
            )}

            {/* ── Business — boss only (not admin) ──────────────────────────────── */}
            {user.role === 'boss' && (
                <NavSection title="Business">
                    <NavItem to="/boss/stats"      icon={DollarSign}      label="Revenue"     />
                    <NavItem to="/boss/team"       icon={Users}           label="Team"        />
                    <NavItem to="/boss/locations"  icon={MapPin}          label="Locations"   />
                </NavSection>
            )}

            {/* ── System — admin only ───────────────────────────────────────────── */}
            {isAdmin && (
                <NavSection title="System">
                    <NavItem to="/admin"            icon={ShieldCheck}     label="Dashboard"     />
                    <NavItem to="/admin/users"      icon={Users}           label="All Users"     />
                    <NavItem to="/admin/company"    icon={Building2}       label="Company"       />
                    <NavItem to="/boss/team"        icon={Users}           label="Team"          />
                    <NavItem to="/boss/locations"   icon={MapPin}          label="Locations"     />
                    <NavItem to="/manager/cars"     icon={Car}             label="Fleet"         />
                    <NavItem to="/manager/rentals"  icon={CalendarRange}   label="Rentals"       />
                    <NavItem to="/manager/stats"    icon={BarChart2}       label="Statistics"    />
                    <NavItem to="/boss/stats"       icon={DollarSign}      label="Revenue"       />
                    <NavItem to="/dashboard/profile" icon={User}           label="Profile"       />
                </NavSection>
            )}

        </aside>
    );
}

function NavSection({ title, children }) {
    return (
        <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {title}
            </p>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function NavItem({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )
            }
        >
            <Icon className="h-4 w-4 rounded-md bg-muted/70 p-1 text-primary shrink-0" />
            {label}
        </NavLink>
    );
}