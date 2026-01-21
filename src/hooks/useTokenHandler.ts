// Custom hook for handling token expiration
import { useAuth } from '@/contexts/AuthContext';
import { handleApiError } from '@/utils/tokenHandler';

export const useTokenHandler = () => {
  const { logout } = useAuth();

  const handleError = (error: any) => {
    return handleApiError(error, logout);
  };

  return { handleError };
};