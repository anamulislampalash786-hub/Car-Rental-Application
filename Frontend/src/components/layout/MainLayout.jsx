import Navbar  from './Navbar';
import Sidebar from './Sidebar';
import useAuthStore from '@/store/authStore';

export default function MainLayout({ children }) {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                {user && <Sidebar />}
                <main className="flex-1 p-6 max-w-full overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}