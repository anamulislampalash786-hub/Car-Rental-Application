import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllLocationsApi, getLocationApi, getCarsAtLocationApi,
    createLocationApi, updateLocationApi, deactivateLocationApi,
} from '@/api/location.api';

export const useAllLocations = (params) =>
    useQuery({
        queryKey: ['locations', params],
        queryFn:  () => getAllLocationsApi(params).then((r) => r.data.data.locations),
    });

export const useLocations = (id) =>
    useQuery({
        queryKey: ['locations', id],
        queryFn:  () => getLocationApi(id).then((r) => r.data.data.location),
        enabled:  !!id,
    });

export const useCarsAtLocation = (id, params) =>
    useQuery({
        queryKey: ['locations', id, 'cars', params],
        queryFn:  () => getCarsAtLocationApi(id, params).then((r) => r.data.data),
        enabled:  !!id,
        staleTime: 0,           // ✅ always considered stale — refetches when invalidated
        refetchOnWindowFocus: true, // ✅ refetch when user comes back to tab
    });

export const useCreateLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createLocationApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
    });
};

export const useUpdateLocation = (id) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => updateLocationApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            queryClient.invalidateQueries({ queryKey: ['locations', id] });
        },
    });
};

export const useDeactivateLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deactivateLocationApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
    });
};