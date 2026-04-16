import { useState } from 'react';
import { Search, Lock, Unlock, ShieldCheck, Loader2, Users } from 'lucide-react';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllUsers, useLockUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ─── Role badge ───────────────────────────────────────────────────────────────

const roleColor = {
    user:    'bg-gray-100 text-gray-700',
    manager: 'bg-blue-100 text-blue-700',
    boss:    'bg-purple-100 text-purple-700',
    admin:   'bg-red-100 text-red-700',
};

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({ user }) {
    const { mutate: lockUser, isPending } = useLockUser();

    const initials = user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const handleLock = () => {
        lockUser(user._id, {
            onSuccess: () =>
                toast.success(`${user.name} has been ${user.isLocked ? 'unlocked' : 'locked'}`),
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Action failed'),
        });
    };

    return (
        <div className={`p-4 rounded-xl border bg-card transition-colors ${user.isLocked ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4 flex-wrap">

                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary text-sm">
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{user.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColor[user.role] || roleColor.user}`}>
              {user.role}
            </span>
                        {user.isLocked && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Locked
              </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {user.phone} · Joined {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy') : '—'}
                    </p>
                </div>

                {/* Actions */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLock}
                    disabled={isPending}
                    className={user.isLocked ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-destructive border-red-200 hover:bg-red-50'}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.isLocked ? (
                        <><Unlock className="h-3.5 w-3.5 mr-1.5" />Unlock</>
                    ) : (
                        <><Lock className="h-3.5 w-3.5 mr-1.5" />Lock</>
                    )}
                </Button>

            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManageUsers() {
    const [search, setSearch]       = useState('');
    const [roleFilter, setRole]     = useState('all');

    const params = roleFilter !== 'all' ? { role: roleFilter } : {};
    const { data: users, isLoading } = useAllUsers(params);

    const filtered = search
        ? users?.filter((u) =>
            `${u.name} ${u.email} ${u.phone}`
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        : users;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Manage Users</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {filtered?.length ?? 0} users found
                </p>
            </div>

            {/* Search + role filter */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email or phone..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'user', 'manager', 'boss', 'admin'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                                roleFilter === r
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            ) : filtered?.length === 0 ? (
                <div className="text-center py-16 border rounded-xl text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No users found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered?.map((user) => (
                        <UserCard key={user._id} user={user} />
                    ))}
                </div>
            )}

        </div>
    );
}