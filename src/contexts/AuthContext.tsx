import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, LoginResponse } from '@/services/authService';
import { User } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchInstitution: (institutionId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Check for existing session on app load
    const savedToken = localStorage.getItem('payflow_token');
    const savedUser = localStorage.getItem('payflow_user');
    
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        
        // Ensure institution ID is stored separately for consistent access
        const storedInstitutionId = localStorage.getItem('payflow_institution_id');
        if (!storedInstitutionId && user.institutionId) {
          localStorage.setItem('payflow_institution_id', user.institutionId);
          console.log('Set missing institution ID from user data:', user.institutionId);
        }
        
        setAuthState({
          user,
          token: savedToken,
          isLoading: false,
          isAuthenticated: true
        });
      } catch (error) {
        // Clear invalid data
        console.log('Invalid session data found, clearing all PayFlow data');
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('payflow_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login(username, password);
      
      // Save to localStorage - including institution ID for consistent access
      localStorage.setItem('payflow_token', response.token);
      localStorage.setItem('payflow_user', JSON.stringify(response.user));
      localStorage.setItem('payflow_institution_id', response.user.institutionId);
      
      console.log('Login successful - Institution ID set:', response.user.institutionId);
      
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    // Clear ALL PayFlow-related localStorage data to prevent data leakage between users
    localStorage.removeItem('payflow_token');
    localStorage.removeItem('payflow_user');
    localStorage.removeItem('payflow_institution_id');
    
    // Also clear any other PayFlow-related keys that might exist
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('payflow_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Cleared localStorage key:', key);
    });
    
    console.log('Logout complete - All PayFlow data cleared from localStorage');
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    });
  };

  const switchInstitution = async (institutionId: string) => {
    // This would typically make an API call to switch context
    // For now, we'll just simulate it
    if (authState.user) {
      const updatedUser = { ...authState.user, institutionId };
      localStorage.setItem('payflow_user', JSON.stringify(updatedUser));
      localStorage.setItem('payflow_institution_id', institutionId);
      
      console.log('Institution switched to:', institutionId);
      
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      switchInstitution
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};