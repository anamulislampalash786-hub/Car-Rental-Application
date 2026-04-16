import api from './axios';

export const getAllCarsApi = (params) =>
    api.get('/cars', { params });

export const getCarApi = (id) =>
    api.get(`/cars/${id}`);

export const createCarApi = (data) =>
    api.post('/cars', data); // data is FormData

export const updateCarApi = (id, data) =>
    api.patch(`/cars/${id}`, data); // data is FormData

export const deleteCarApi = (id) =>
    api.delete(`/cars/${id}`);

export const addReviewApi = (id, data) =>
    api.post(`/cars/${id}/reviews`, data);