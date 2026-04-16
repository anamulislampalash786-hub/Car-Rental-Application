import api from './axios';

export const getManagerStatsApi = () =>
    api.get('/stats/manager');

export const getBossStatsApi = () =>
    api.get('/stats/boss');

export const getAdminStatsApi = () =>
    api.get('/stats/admin');