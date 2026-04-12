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
      await qc.cancelQueries({ queryKey: ['application', id] });
      const previous = qc.getQueryData<Application[]>(QUERY_KEY);
      const previousApplication = qc.getQueryData<Application>(['application', id]);

      qc.setQueryData<Application[]>(QUERY_KEY, (old) =>
        old?.map((app) => (app._id === id ? { ...app, ...data } : app)) ?? []
      );
      qc.setQueryData<Application>(['application', id], (old) =>
        old ? { ...old, ...data } : old
      );

      return { previous, previousApplication, id };
    },
    onSuccess: (updated) => {
      qc.setQueryData<Application>(['application', updated._id], updated);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(QUERY_KEY, context.previous);
      if (context?.previousApplication) {
        qc.setQueryData(['application', context.id], context.previousApplication);
      }
    },
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['application', vars.id] });
    },
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
