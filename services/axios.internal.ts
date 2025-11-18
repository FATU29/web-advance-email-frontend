import { createAxiosInstance } from './axios.bi';

// Internal API axios instance (if needed)
export const axiosInternal = createAxiosInstance(
  process.env.NEXT_PUBLIC_INTERNAL_API_BASE_URL || ''
);
