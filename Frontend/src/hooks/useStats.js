import { useQuery } from '@tanstack/react-query';
import {
    getManagerStatsApi, getBossStatsApi, getAdminStatsApi,
} from '@/api/stats.api';

export const useManagerStats = () =>
    useQuery({
        queryKey: ['stats', 'manager'],
        queryFn:  () => getManagerStatsApi().then((r) => r.data.data),
    });

export const useBossStats = () =>
    useQuery({
        queryKey: ['stats', 'boss'],
        queryFn:  () => getBossStatsApi().then((r) => r.data.data),
    });

export const useAdminStats = () =>
    useQuery({
        queryKey: ['stats', 'admin'],
        queryFn:  () => getAdminStatsApi().then((r) => r.data.data),
    });