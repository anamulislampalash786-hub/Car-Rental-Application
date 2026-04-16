import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    requestRentalApi, getMyRentalsApi, getAllRentalsApi,
    getRentalApi, processRentalApi, activateRentalApi, returnCarApi,
} from '@/api/rental.api';

export const useMyRentals = () =>
    useQuery({
        queryKey: ['rentals', 'my'],
        queryFn:  () => getMyRentalsApi().then((r) => r.data.data),
    });

export const useAllRentals = (params) =>
    useQuery({
        queryKey: ['rentals', params],
        queryFn:  () => getAllRentalsApi(params).then((r) => r.data.data.rentals),
    });

export const useRentals = (id) =>
    useQuery({
        queryKey: ['rentals', id],
        queryFn:  () => getRentalApi(id).then((r) => r.data.data.rental),
        enabled:  !!id,
    });

export const useRequestRental = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: requestRentalApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });
};

export const useProcessRental = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, action }) => processRentalApi(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });
};

export const useActivateRental = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: activateRentalApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rentals'] }),
    });
};

export const useReturnCar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => returnCarApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rentals'] });
            queryClient.invalidateQueries({ queryKey: ['cars'] });
            queryClient.invalidateQueries({ queryKey: ['locations'] }); // ✅ refresh location car counts
        },
    });
};