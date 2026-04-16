import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    loginApi, registerApi, logoutApi,
    forgotPasswordApi, resetPasswordApi, updatePasswordApi,
} from '@/api/auth.api';
import useAuthStore from '@/store/authStore';

export const useLogin = () => {
    const { setAuth }  = useAuthStore();
    const navigate     = useNavigate();

    return useMutation({
        mutationFn: loginApi,
        onSuccess: (res) => {
            const user = res.data.data.user;

            // ✅ block locked users immediately on login
            if (user.isLocked) {
                toast.error('Your account has been locked. Please contact support.', {
                    duration: 6000,
                });
                return; // don't set auth, don't navigate
            }

            setAuth(user, res.data.token);
            const role = user.role;
            if (role === 'admin')         navigate('/admin');
            else if (role === 'boss')     navigate('/boss');
            else if (role === 'manager')  navigate('/manager');
            else                          navigate('/dashboard');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Login failed');
        },
    });
};

export const useRegister = () => {
    const { setAuth } = useAuthStore();
    const navigate    = useNavigate();

    return useMutation({
        mutationFn: registerApi,
        onSuccess: (res) => {
            setAuth(res.data.data.user, res.data.token);
            navigate('/login');
        },
    });
};

export const useLogout = () => {
    const { clearAuth } = useAuthStore();
    const navigate      = useNavigate();
    const queryClient   = useQueryClient();

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            navigate('/');
        },
        // ✅ even if API call fails, still clear local state and redirect
        onError: () => {
            clearAuth();
            queryClient.clear();
            navigate('/');
        },
    });
};

export const useForgotPassword = () =>
    useMutation({ mutationFn: ({ email }) => forgotPasswordApi(email) });

export const useResetPassword = (token) =>
    useMutation({ mutationFn: (data) => resetPasswordApi(token, data) });

export const useUpdatePassword = () =>
    useMutation({ mutationFn: updatePasswordApi });