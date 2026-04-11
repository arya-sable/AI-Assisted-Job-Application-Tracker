import axiosInstance from './axiosInstance';
import type { ParsedJobDescription } from '../types';

export const parseJobDescription = async (jobDescription: string): Promise<ParsedJobDescription> => {
  const res = await axiosInstance.post<ParsedJobDescription>('/ai/parse', { jobDescription });
  return res.data;
};
