import axiosInstance from './axiosInstance';
import type { Application, CreateApplicationInput } from '../types';

export const getApplications = async (): Promise<Application[]> => {
  const res = await axiosInstance.get<Application[]>('/applications');
  return res.data;
};

export const getApplication = async (id: string): Promise<Application> => {
  const res = await axiosInstance.get<Application>(`/applications/${id}`);
  return res.data;
};

export const createApplication = async (data: CreateApplicationInput): Promise<Application> => {
  const res = await axiosInstance.post<Application>('/applications', data);
  return res.data;
};

export const updateApplication = async (id: string, data: Partial<Application>): Promise<Application> => {
  const res = await axiosInstance.patch<Application>(`/applications/${id}`, data);
  return res.data;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/applications/${id}`);
};
