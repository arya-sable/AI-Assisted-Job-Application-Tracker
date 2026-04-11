import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import type { ParsedJobDescription } from '../types';
import { AxiosError } from 'axios';

interface UseAiParseReturn {
  parse: (jobDescription: string) => Promise<ParsedJobDescription | null>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useAiParse = (): UseAiParseReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = async (jobDescription: string): Promise<ParsedJobDescription | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post<ParsedJobDescription>('/ai/parse', { jobDescription });
      return res.data;
    } catch (err: unknown) {
      let message = 'Failed to parse job description. Please try again.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => setError(null);

  return { parse, isLoading, error, reset };
};
