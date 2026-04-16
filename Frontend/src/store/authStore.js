// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
//
// const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
//
// const useAuthStore = create(
//     persist(
//         (set, get) => ({
//             user:  null,
//             token: null,
//
//             setAuth: (user, token) => {
//                 localStorage.setItem('token', token);
//                 set({ user, token });
//             },
//
//             clearAuth: () => {
//                 localStorage.removeItem('token');
//                 set({ user: null, token: null });
//             },
//
//             updateUser: (updatedUser) =>
//                 set({ user: { ...get().user, ...updatedUser } }),
//
//             // role helpers
//             isAtLeast: (minRole) => {
//                 const { user } = get();
//                 if (!user) return false;
//                 return ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf(minRole);
//             },
//             isManager: () => get().isAtLeast('manager'),
//             isBoss:    () => get().isAtLeast('boss'),
//             isAdmin:   () => get().user?.role === 'admin',
//         }),
//         {
//             name:    'auth-storage',
//             partialize: (state) => ({ user: state.user, token: state.token }),
//         }
//     )
// );
//
// export default useAuthStore;

import { create }   from 'zustand';
import { persist }  from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user:         null,
            token:        null,
            _hasHydrated: false,   // ✅ track hydration

            setHasHydrated: (val) => set({ _hasHydrated: val }),

            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token });
            },

            clearAuth: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            },

            updateUser: (updatedUser) =>
                set({ user: { ...get().user, ...updatedUser } }),

            isAtLeast: (minRole) => {
                const ROLE_HIERARCHY = ['user', 'manager', 'boss', 'admin'];
                const { user } = get();
                if (!user) return false;
                return ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf(minRole);
            },
            isManager: () => get().isAtLeast('manager'),
            isBoss:    () => get().isAtLeast('boss'),
            isAdmin:   () => get().user?.role === 'admin',
        }),
        {
            name:        'auth-storage',
            partialize:  (state) => ({ user: state.user, token: state.token }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);  // ✅ called when rehydration completes
            },
        }
    )
);

export default useAuthStore;