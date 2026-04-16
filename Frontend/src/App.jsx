import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// layout
import MainLayout   from '@/components/layout/MainLayout';
import PublicLayout from '@/components/layout/PublicLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// public pages
import Home      from '@/pages/public/Home';
import Cars      from '@/pages/public/Cars';
import CarDetail from '@/pages/public/CarDetail';
import Locations from '@/pages/public/Locations';
import About     from '@/pages/public/About';

// auth pages
import Login    from '@/pages/auth/Login.jsx';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword  from '@/pages/auth/ResetPassword';

// user pages
import Dashboard from '@/pages/user/Dashboard';
import MyRentals from '@/pages/user/MyRentals';
import Profile   from '@/pages/user/Profile';

// manager pages
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import ManageCars       from '@/pages/manager/ManageCars';
import ManageRentals    from '@/pages/manager/ManageRentals';
import ManageUsers      from '@/pages/manager/ManageUsers';
import ManagerStats     from '@/pages/manager/ManagerStats';

// boss pages
import BossDashboard from '@/pages/boss/BossDashboard';
import BossStats     from '@/pages/boss/BossStats';
import BossTeam      from '@/pages/boss/BossTeam';
import BossLocations from '@/pages/boss/BossLocations';

// admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCompany   from '@/pages/admin/AdminCompany';
import AdminUsers     from '@/pages/admin/AdminUsers';

// ─── Wrappers ─────────────────────────────────────────────────────────────────

function PublicPage({ children }) {
    return <PublicLayout>{children}</PublicLayout>;
}

function PrivatePage({ children, minRole = 'user' }) {
    return (
        <ProtectedRoute minRole={minRole}>
            <MainLayout>{children}</MainLayout>
        </ProtectedRoute>
    );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ── Public ─────────────────────────────────────────────────────── */}
                <Route path="/" element={<PublicPage><Home /></PublicPage>} />
                <Route path="/cars"      element={<PublicPage><Cars /></PublicPage>} />
                <Route path="/cars/:id"  element={<PublicPage><CarDetail /></PublicPage>} />
                <Route path="/locations" element={<PublicPage><Locations /></PublicPage>} />
                <Route path="/about"     element={<PublicPage><About /></PublicPage>} />
                <Route path="/login"     element={<PublicPage><Login /></PublicPage>} />
                <Route path="/register"  element={<PublicPage><Register /></PublicPage>} />
                <Route path="/forgot-password"       element={<PublicPage><ForgotPassword /></PublicPage>} />
                <Route path="/reset-password/:token" element={<PublicPage><ResetPassword /></PublicPage>} />

                {/* ── User ───────────────────────────────────────────────────────── */}
                <Route path="/dashboard" element={<PrivatePage><Dashboard /></PrivatePage>} />
                <Route path="/dashboard/rentals"  element={<PrivatePage><MyRentals /></PrivatePage>} />
                <Route path="/dashboard/profile"  element={<PrivatePage><Profile /></PrivatePage>} />

                {/* ── Manager ────────────────────────────────────────────────────── */}
                <Route path="/manager"          element={<PrivatePage minRole="manager"><ManagerDashboard /></PrivatePage>} />
                <Route path="/manager/cars"     element={<PrivatePage minRole="manager"><ManageCars /></PrivatePage>} />
                <Route path="/manager/rentals"  element={<PrivatePage minRole="manager"><ManageRentals /></PrivatePage>} />
                <Route path="/manager/users"    element={<PrivatePage minRole="manager"><ManageUsers /></PrivatePage>} />
                <Route path="/manager/stats"    element={<PrivatePage minRole="manager"><ManagerStats /></PrivatePage>} />
                {/**/}
                {/* ── Boss ───────────────────────────────────────────────────────── */}
                <Route path="/boss"           element={<PrivatePage minRole="boss"><BossDashboard /></PrivatePage>} />
                <Route path="/boss/stats"     element={<PrivatePage minRole="boss"><BossStats /></PrivatePage>} />
                <Route path="/boss/team"      element={<PrivatePage minRole="boss"><BossTeam /></PrivatePage>} />
                <Route path="/boss/locations" element={<PrivatePage minRole="boss"><BossLocations /></PrivatePage>} />
                {/**/}
                {/* ── Admin ──────────────────────────────────────────────────────── */}
                <Route path="/admin"         element={<PrivatePage minRole="admin"><AdminDashboard /></PrivatePage>} />
                <Route path="/admin/company" element={<PrivatePage minRole="admin"><AdminCompany /></PrivatePage>} />
                <Route path="/admin/users"   element={<PrivatePage minRole="admin"><AdminUsers /></PrivatePage>} />
                {/**/}
                {/* ── 404 ────────────────────────────────────────────────────────── */}
                <Route path="*" element={
                    <PublicPage>
                        <div className="text-center py-24">
                            <h1 className="text-4xl font-bold">404</h1>
                            <p className="text-muted-foreground mt-2">Page not found</p>
                        </div>
                    </PublicPage>
                } />
            </Routes>

            <Toaster position="top-right" richColors closeButton />
        </BrowserRouter>
    );
}