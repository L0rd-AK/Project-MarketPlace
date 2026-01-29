import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/auth/me');
        return response.data.user;
      } catch (error: any) {
        // Return null for any auth errors instead of throwing
        if (error.response?.status === 401 || error.response?.status === 403) {
          return null;
        }
        // For network errors or other issues, also return null to prevent infinite loading
        console.error('Auth check failed:', error.message);
        return null;
      }
    },
    retry: false,
    staleTime: Infinity, // Don't refetch automatically
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      toast.success('Login successful!');

      // Redirect based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'BUYER':
          navigate('/buyer');
          break;
        case 'SOLVER':
          navigate('/solver');
          break;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post('/api/auth/register', data);
      return response.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
      toast.success('Registration successful!');
      navigate('/solver');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
