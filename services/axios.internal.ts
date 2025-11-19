import { createAxiosInstance } from './axios.bi';

// Internal API axios instance (if needed)
// This instance uses the same token management as axiosBI
export const axiosInternal = createAxiosInstance(
  process.env.NEXT_PUBLIC_INTERNAL_API_BASE_URL || ''
);
