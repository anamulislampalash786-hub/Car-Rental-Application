import api from './axios';

export const getMeApi = () =>
    api.get('/users/me');

export const updateMeApi = (data) =>
    api.patch('/users/updateMe', data);

export const unregisterApi = () =>
    api.delete('/users/unregister');

export const getAllUsersApi = (params) =>
    api.get('/users', { params });

export const lockUserApi = (id) =>
    api.patch(`/users/${id}/lock`);

export const updateUserRoleApi = (id, role) =>
    api.patch(`/users/${id}/role`, { role });