import api from './axios';

export const getCompanyApi = () =>
    api.get('/company');

export const getBossesApi = () =>
    api.get('/company/bosses');

export const getManagersApi = () =>
    api.get('/company/managers');

export const createCompanyApi = (data) =>
    api.post('/company', data); // FormData for logo

export const updateCompanyApi = (data) =>
    api.patch('/company', data); // FormData for logo