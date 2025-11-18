// Common types used across the application

export type TStatus = 'idle' | 'loading' | 'success' | 'error';

export type TPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TApiResponse<T = any> = {
  data: T;
  message?: string;
  success: boolean;
  pagination?: TPagination;
};

export type TError = {
  message: string;
  code?: string | number;
  details?: any;
};
