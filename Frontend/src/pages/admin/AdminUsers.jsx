import { useState } from 'react';
import {
    Search, Lock, Unlock, ShieldCheck,
    Loader2, Users, Filter,
} from 'lucide-react';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAllUsers, useLockUser, useUpdateUserRole } from '@/hooks/useUser';
import { toast }  from 'sonner';
import { format } from 'date-fns';
import useAuthStore from '@/store/authStore';

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];

const roleColor = {
    user:    'bg-gray-100 text-gray-700',
    manager: 'bg-blue-100 text-blue-700',
    boss:    'bg-purple-100 text-purple-700',
    admin:   'bg-red-100 text-red-700',
};

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({ member }) {
    const {user} = useAuthStore();
    const {mutate: lockUser, isPending: locking} = useLockUser();
    const {mutate: updateRole, isPending: rolePending} = useUpdateUserRole();

    // ✅ hard guard — should never happen after filter but just in case
    if (!member?._id) return null;

    const isSelf = user?._id?.toString() === member._id?.toString();
    const isAdminMember = member.role === 'admin';
    const canModify = !isSelf && !isAdminMember;

    const currentLevel = ROLE_HIERARCHY.indexOf(user?.role ?? 'user');
    const targetLevel = ROLE_HIERARCHY.indexOf(member.role);
    const canChangeRole = canModify && targetLevel < currentLevel;

    const initials = member.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() ?? '?';

    const handleLock = () => {
        lockUser(member._id, {
            onSuccess: () =>
                toast.success(`${member.name} ${member.isLocked ? 'unlocked' : 'locked'}`),
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    const handleRoleChange = (role) => {
        if (role === member.role) return;
        updateRole(
            {id: member._id, role},
            {
                onSuccess: () =>
                    toast.success(`${member.name}'s role updated to ${role}`),
                onError: (err) =>
                    toast.error(err.response?.data?.message || 'Failed'),
            }
        );
    };

    return (
        <div className={`p-4 rounded-xl border bg-card ${member.isLocked ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4 flex-wrap">

                {/* Avatar */}
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary">
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-medium">{member.name}</p>
                        {isSelf && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                You
              </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColor[member.role] || roleColor.user}`}>
              {member.role}
            </span>
                        {member.isLocked && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Locked
              </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {member.phone && `${member.phone} · `}
                        Joined{' '}
                        {member.createdAt
                            ? format(new Date(member.createdAt), 'dd MMM yyyy')
                            : '—'}
                    </p>
                </div>

                {/* Actions */}
                {canModify && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {canChangeRole && (
                            <Select
                                defaultValue={member.role}
                                onValueChange={handleRoleChange}
                                disabled={rolePending}
                            >
                                <SelectTrigger className="h-8 w-32 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_HIERARCHY.filter((r) =>
                                        ROLE_HIERARCHY.indexOf(r) < currentLevel
                                    ).map((r) => (
                                        <SelectItem key={r} value={r} className="text-xs capitalize">
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleLock}
                            disabled={locking}
                            className={member.isLocked
                                ? 'text-green-600 border-green-200 hover:bg-green-50'
                                : 'text-destructive border-red-200 hover:bg-red-50'
                            }
                        >
                            {locking ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : member.isLocked ? (
                                <><Unlock className="h-3.5 w-3.5 mr-1.5" />Unlock</>
                            ) : (
                                <><Lock className="h-3.5 w-3.5 mr-1.5" />Lock</>
                            )}
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsers() {
    const [search,     setSearch]     = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [lockFilter, setLockFilter] = useState('all');

    const params = roleFilter !== 'all' ? { role: roleFilter } : {};
    const { data: users = [], isLoading } = useAllUsers(params);

    const filtered = users?.filter((u) => {
        // ✅ skip undefined/null items
        if (!u || !u._id) return false;

        const matchSearch = search
            ? `${u.name ?? ''} ${u.email ?? ''} ${u.phone ?? ''}`
                .toLowerCase()
                .includes(search.toLowerCase())
            : true;

        const matchLock =
            lockFilter === 'all'    ? true :
                lockFilter === 'locked' ? u.isLocked :
                    !u.isLocked;

        return matchSearch && matchLock;
    }) ?? [];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">All Users</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {filtered.length} users found
                </p>
            </div>

            {/* Filters */}
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
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="boss">Boss</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={lockFilter} onValueChange={setLockFilter}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="All users" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All users</SelectItem>
                        <SelectItem value="active">Active only</SelectItem>
                        <SelectItem value="locked">Locked only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 border rounded-xl text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No users found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((u) => (
                        // ✅ key on _id which we know exists after filter
                        <UserCard key={u._id} member={u} />
                    ))}
                </div>
            )}

        </div>
    );
}