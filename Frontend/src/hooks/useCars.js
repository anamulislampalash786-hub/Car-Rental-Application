import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllCarsApi, getCarApi, createCarApi,
    updateCarApi, deleteCarApi, addReviewApi,
} from '@/api/car.api';

export const useAllCars = (params) =>
    useQuery({
        queryKey: ['cars', params],
        queryFn:  () => getAllCarsApi(params).then((r) => r.data.data.cars),
    });

export const useCar = (id) =>
    useQuery({
        queryKey: ['cars', id],
        queryFn:  () => getCarApi(id).then((r) => r.data.data.car),
        enabled:  !!id,
    });

export const useCreateCar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCarApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
    });
};

export const useUpdateCar = (id) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => updateCarApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
            queryClient.invalidateQueries({ queryKey: ['cars', id] });
            queryClient.invalidateQueries({ queryKey: ['locations'] }); // ✅ refresh location counts
        },
    });
};

export const useDeleteCar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCarApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
    });
};

export const useAddReview = (carId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => addReviewApi(carId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cars', carId] }),
    });
};