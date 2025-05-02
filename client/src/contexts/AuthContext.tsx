import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApiRequest } from '../lib/queryClient';

// User interface
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  farmName?: string;
  location?: string;
  createdAt?: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Register data interface
interface RegisterData {
  username: string;
  email: string;
  password: string;
  farmName?: string;
  location?: string;
}

// Context default values
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();

  // Initial state
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load user on initial load and token change
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const data = await authApiRequest<{user: User}>('/api/auth/me', 'GET', undefined, state.token);
          
          setState(prev => ({
            ...prev,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error) {
          localStorage.removeItem('token');
          setState(prev => ({
            ...prev,
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication error. Please log in again.',
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    loadUser();
  }, [state.token]);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      interface LoginResponse {
        user: User;
        token: string;
      }

      const data = await authApiRequest<LoginResponse>('/api/auth/login', 'POST', { email, password });
      
      localStorage.setItem('token', data.token);
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed. Please try again.',
      }));
    }
  };

  // Register user
  const register = async (userData: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      interface RegisterResponse {
        user: User;
        token: string;
      }

      const data = await authApiRequest<RegisterResponse>('/api/auth/register', 'POST', userData);
      
      localStorage.setItem('token', data.token);
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      }));
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    // Invalidate any relevant queries
    queryClient.invalidateQueries();
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;