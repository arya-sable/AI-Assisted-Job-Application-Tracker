import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import type { Application, CreateApplicationInput, UpdateApplicationInput } from '../types';

const QUERY_KEY = ['applications'] as const;

export const useApplications = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await axiosInstance.get<Application[]>('/applications');
      return res.data;
    },
  });

export const useApplication = (id: string) =>
  useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const res = await axiosInstance.get<Application>(`/applications/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateApplicationInput) => {
      const res = await axiosInstance.post<Application>('/applications', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateApplicationInput) => {
      const res = await axiosInstance.patch<Application>(`/applications/${id}`, data);
      return res.data;
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Application[]>(QUERY_KEY);
      qc.setQueryData<Application[]>(QUERY_KEY, (old) =>
        old?.map((app) => (app._id === id ? { ...app, ...data } : app)) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(QUERY_KEY, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/applications/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
