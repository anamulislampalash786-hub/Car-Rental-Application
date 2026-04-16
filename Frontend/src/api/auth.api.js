import api from './axios';

export const registerApi = (data) =>
    api.post('/auth/register', data);

export const loginApi = (data) =>
    api.post('/auth/login', data);

export const logoutApi = () =>
    api.post('/auth/logout');

export const forgotPasswordApi = (email) =>
    api.post('/auth/forgotPassword', { email });

export const resetPasswordApi = (token, data) =>
    api.patch(`/auth/resetPassword/${token}`, data);

export const updatePasswordApi = (data) =>
    api.patch('/auth/updateMyPassword', data);