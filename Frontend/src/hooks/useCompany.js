import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCompanyApi, getBossesApi, getManagersApi,
    createCompanyApi, updateCompanyApi,
} from '@/api/company.api';

export const useCompany = () =>
    useQuery({
        queryKey: ['company'],
        queryFn:  () => getCompanyApi().then((r) => r.data.data.company),
    });

export const useBosses = () =>
    useQuery({
        queryKey: ['company', 'bosses'],
        queryFn:  () => getBossesApi().then((r) => r.data.data.bosses),
    });

export const useManagers = () =>
    useQuery({
        queryKey: ['company', 'managers'],
        queryFn:  () => getManagersApi().then((r) => r.data.data.managers),
    });

export const useCreateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCompanyApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company'] }),
    });
};

export const useUpdateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCompanyApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company'] }),
    });
};