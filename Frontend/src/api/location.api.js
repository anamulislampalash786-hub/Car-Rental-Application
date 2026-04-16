import api from './axios';

export const getAllLocationsApi = (params) =>
    api.get('/locations', { params });

export const getLocationApi = (id) =>
    api.get(`/locations/${id}`);

export const getCarsAtLocationApi = (id, params) =>
    api.get(`/locations/${id}/cars`, { params });

export const createLocationApi = (data) =>
    api.post('/locations', data);

export const updateLocationApi = (id, data) =>
    api.patch(`/locations/${id}`, data);

export const deactivateLocationApi = (id) =>
    api.delete(`/locations/${id}`);