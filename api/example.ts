// Example API file
import { axiosBI } from '@/services/axios.bi';
import { CustomAxiosResponse } from '@/services/axios.bi';
import { TApiResponse } from '@/types/common.types';

// Example: Get user data
export const getUserData = async (
  userId: string
): Promise<CustomAxiosResponse<TApiResponse>> => {
  return await axiosBI.get(`/users/${userId}`);
};

// Example: Post data
export const createUser = async (
  data: any
): Promise<CustomAxiosResponse<TApiResponse>> => {
  return await axiosBI.post('/users', data);
};
