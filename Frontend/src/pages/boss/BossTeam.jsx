import { useState }      from 'react';
import {
    Users, Lock, Unlock, ShieldCheck,
    Loader2, Search,
} from 'lucide-react';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllUsers, useLockUser, useUpdateUserRole } from '@/hooks/useUser';
import useAuthStore  from '@/store/authStore';
import { toast }     from 'sonner';
import { format }    from 'date-fns';

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];

const roleColor = {
    user:    'bg-gray-100 text-gray-700',
    manager: 'bg-blue-100 text-blue-700',
    boss:    'bg-purple-100 text-purple-700',
    admin:   'bg-red-100 text-red-700',
};

// ─── Team Member Card ─────────────────────────────────────────────────────────

function TeamCard({ member, viewerRole }) {
    const { mutate: lockUser,   isPending: locking   } = useLockUser();
    const { mutate: updateRole, isPending: promoting  } = useUpdateUserRole();

    const initials = member.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const viewerLevel  = ROLE_HIERARCHY.indexOf(viewerRole);
    const memberLevel  = ROLE_HIERARCHY.indexOf(member.role);

    // can only modify users strictly below your level
    const canModify    = memberLevel < viewerLevel;
    const isLocked     = member.isLocked;

    const handleLock = () => {
        lockUser(member._id, {
            onSuccess: () =>
                toast.success(`${member.name} ${isLocked ? 'unlocked' : 'locked'}`),
            onError: (err) =>
                toast.error(err.response?.data?.message || 'Failed'),
        });
    };

    const handleRoleChange = (newRole) => {
        updateRole(
            { id: member._id, role: newRole },
            {
                onSuccess: () =>
                    toast.success(`${member.name} role updated to ${newRole}`),
                onError: (err) =>
                    toast.error(err.response?.data?.message || 'Failed'),
            }
        );
    };

    // what roles can this viewer assign to this member
    const assignableRoles = ROLE_HIERARCHY.filter((r) => {
        const rLevel = ROLE_HIERARCHY.indexOf(r);
        return rLevel < viewerLevel && r !== member.role;
    });

    return (
        <div className={`p-4 rounded-xl border bg-card transition-colors ${isLocked ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4 flex-wrap">

                {/* Avatar */}
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary">
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-medium">{member.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColor[member.role]}`}>
              {member.role}
            </span>
                        {isLocked && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Locked
              </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {member.phone} · Joined{' '}
                        {member.createdAt
                            ? format(new Date(member.createdAt), 'dd MMM yyyy')
                            : '—'}
                    </p>
                </div>

                {/* Actions — only if viewer outranks member */}
                {canModify && (
                    <div className="flex items-center gap-2 flex-wrap">

                        {/* Role change buttons */}
                        {assignableRoles.map((role) => {
                            const isPromotion =
                                ROLE_HIERARCHY.indexOf(role) > memberLevel;
                            return (
                                <Button
                                    key={role}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRoleChange(role)}
                                    disabled={promoting}
                                    className={
                                        isPromotion
                                            ? 'text-blue-600 border-blue-200 hover:bg-blue-50'
                                            : 'text-orange-600 border-orange-200 hover:bg-orange-50'
                                    }
                                >
                                    {promoting ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                                            {isPromotion ? `Promote to ${role}` : `Demote to ${role}`}
                                        </>
                                    )}
                                </Button>
                            );
                        })}

                        {/* Lock / Unlock */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleLock}
                            disabled={locking}
                            className={isLocked
                                ? 'text-green-600 border-green-200 hover:bg-green-50'
                                : 'text-destructive border-red-200 hover:bg-red-50'
                            }
                        >
                            {locking ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isLocked ? (
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

export default function BossTeam() {
    const [search, setSearch] = useState('');
    const [tab,    setTab]    = useState('managers');
    const { user }            = useAuthStore();

    const isAdmin = user?.role === 'admin';

    // admin sees boss + manager + user, boss sees manager + user
    const { data: bosses,   isLoading: loadingB } = useAllUsers({ role: 'boss'    });
    const { data: managers, isLoading: loadingM } = useAllUsers({ role: 'manager' });
    const { data: users,    isLoading: loadingU } = useAllUsers({ role: 'user'    });

    const filterList = (list) =>
        search
            ? list?.filter((u) =>
                `${u.name} ${u.email}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
            : list;

    const filteredBosses   = filterList(bosses)   ?? [];
    const filteredManagers = filterList(managers) ?? [];
    const filteredUsers    = filterList(users)    ?? [];

    // tabs — admin sees bosses tab too
    const tabs = isAdmin
        ? ['bosses', 'managers', 'users']
        : ['managers', 'users'];

    const countMap = {
        bosses:   filteredBosses.length,
        managers: filteredManagers.length,
        users:    filteredUsers.length,
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Team Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {isAdmin
                        ? 'Manage all staff roles and permissions'
                        : 'Promote users to managers and manage your team'}
                </p>
            </div>

            {/* Summary cards */}
            <div className={`grid gap-4 ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {isAdmin && (
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Bosses</p>
                                <p className="text-2xl font-bold">{bosses?.length ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Managers</p>
                            <p className="text-2xl font-bold">{managers?.length ?? 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Users</p>
                            <p className="text-2xl font-bold">{users?.length ?? 0}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {tabs.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                            tab === t
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {t}
                        <span className="ml-1.5 text-xs opacity-70">
              ({countMap[t] ?? 0})
            </span>
                    </button>
                ))}
            </div>

            {/* Bosses tab — admin only */}
            {tab === 'bosses' && isAdmin && (
                <div className="space-y-3">
                    {loadingB ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))
                    ) : filteredBosses.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No bosses found</p>
                        </div>
                    ) : (
                        filteredBosses.map((b) => (
                            <TeamCard
                                key={b._id}
                                member={b}
                                viewerRole={user?.role}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Managers tab */}
            {tab === 'managers' && (
                <div className="space-y-3">
                    {loadingM ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))
                    ) : filteredManagers.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No managers found</p>
                        </div>
                    ) : (
                        filteredManagers.map((m) => (
                            <TeamCard
                                key={m._id}
                                member={m}
                                viewerRole={user?.role}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Users tab */}
            {tab === 'users' && (
                <div className="space-y-3">
                    {loadingU ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No users found</p>
                        </div>
                    ) : (
                        filteredUsers.map((u) => (
                            <TeamCard
                                key={u._id}
                                member={u}
                                viewerRole={user?.role}
                            />
                        ))
                    )}
                </div>
            )}

        </div>
    );
}