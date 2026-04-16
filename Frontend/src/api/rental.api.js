import api from './axios';

export const requestRentalApi = (data) =>
    api.post('/rentals', data);

export const getMyRentalsApi = () =>
    api.get('/rentals/my');

export const getAllRentalsApi = (params) =>
    api.get('/rentals', { params });

export const getRentalApi = (id) =>
    api.get(`/rentals/${id}`);

export const processRentalApi = (id, action) =>
    api.patch(`/rentals/${id}/process`, { action });

export const activateRentalApi = (id) =>
    api.patch(`/rentals/${id}/activate`);

export const returnCarApi = (id, data) =>
    api.patch(`/rentals/${id}/return`, data);