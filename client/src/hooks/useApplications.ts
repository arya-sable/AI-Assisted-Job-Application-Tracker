import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import type { Application, CreateApplicationInput, UpdateApplicationInput } from '../types';

const applicationsQueryKey = (userId?: string) => ['applications', userId] as const;
const applicationQueryKey = (userId: string | undefined, id: string) => ['application', userId, id] as const;

export const useApplications = () => {
  const { user } = useAuth();
  const userId = user?._id;

  return useQuery({
    queryKey: applicationsQueryKey(userId),
    queryFn: async () => {
      const res = await axiosInstance.get<Application[]>('/applications');
      return res.data;
    },
    enabled: Boolean(userId),
  });
};

export const useApplication = (id: string) => {
  const { user } = useAuth();
  const userId = user?._id;

  return useQuery({
    queryKey: applicationQueryKey(userId, id),
    queryFn: async () => {
      const res = await axiosInstance.get<Application>(`/applications/${id}`);
      return res.data;
    },
    enabled: Boolean(userId && id),
  });
};

export const useCreateApplication = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?._id;

  return useMutation({
    mutationFn: async (data: CreateApplicationInput) => {
      const res = await axiosInstance.post<Application>('/applications', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: applicationsQueryKey(userId) }),
  });
};

export const useUpdateApplication = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?._id;

  return useMutation({
    mutationFn: async ({ id, data }: UpdateApplicationInput) => {
      const res = await axiosInstance.patch<Application>(`/applications/${id}`, data);
      return res.data;
    },
    onMutate: async ({ id, data }) => {
      const listQueryKey = applicationsQueryKey(userId);
      const detailQueryKey = applicationQueryKey(userId, id);

      await qc.cancelQueries({ queryKey: listQueryKey });
      await qc.cancelQueries({ queryKey: detailQueryKey });
      const previous = qc.getQueryData<Application[]>(listQueryKey);
      const previousApplication = qc.getQueryData<Application>(detailQueryKey);

      qc.setQueryData<Application[]>(listQueryKey, (old) =>
        old?.map((app) => (app._id === id ? { ...app, ...data } : app)) ?? []
      );
      qc.setQueryData<Application>(detailQueryKey, (old) =>
        old ? { ...old, ...data } : old
      );

      return { previous, previousApplication, id };
    },
    onSuccess: (updated) => {
      qc.setQueryData<Application>(applicationQueryKey(userId, updated._id), updated);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(applicationsQueryKey(userId), context.previous);
      if (context?.previousApplication) {
        qc.setQueryData(applicationQueryKey(userId, context.id), context.previousApplication);
      }
    },
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({ queryKey: applicationsQueryKey(userId) });
      qc.invalidateQueries({ queryKey: applicationQueryKey(userId, vars.id) });
    },
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const userId = user?._id;

  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/applications/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: applicationsQueryKey(userId) }),
  });
};
