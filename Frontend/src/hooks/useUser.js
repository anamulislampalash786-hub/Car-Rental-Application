import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    getMeApi, updateMeApi, unregisterApi,
    getAllUsersApi, lockUserApi, updateUserRoleApi,
} from '@/api/user.api';
import useAuthStore from '@/store/authStore';

export const useMe = () => {
    const { user, clearAuth } = useAuthStore();
    const navigate            = useNavigate();

    return useQuery({
        queryKey: ['me'],
        queryFn:  async () => {
            const res  = await getMeApi();
            const data = res.data.data.user;

            // ✅ if user got locked while session was active — force logout
            if (data.isLocked) {
                toast.error('Your account has been locked. Please contact support.');
                clearAuth();
                navigate('/login');
                return null;
            }

            return data;
        },
    });
};

export const useUpdateMe = () => {
    const queryClient   = useQueryClient();
    const { updateUser} = useAuthStore();

    return useMutation({
        mutationFn: updateMeApi,
        onSuccess: (res) => {
            const updated = res.data.data.user;
            updateUser(updated);
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useUnregister = () => {
    const { clearAuth } = useAuthStore();
    const queryClient   = useQueryClient();

    return useMutation({
        mutationFn: unregisterApi,
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
        },
    });
};

export const useAllUsers = (params) =>
    useQuery({
        queryKey: ['users', params],
        queryFn:  async () => {
            const res = await getAllUsersApi(params);
            // ✅ safe access with fallback
            return res.data?.data?.users ?? [];
        },
    });

export const useLockUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: lockUserApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, role }) => updateUserRoleApi(id, role),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};