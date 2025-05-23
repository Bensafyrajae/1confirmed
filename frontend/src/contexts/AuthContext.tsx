import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginData, RegisterData } from '../types';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('eventsync_token');
        const storedUser = localStorage.getItem('eventsync_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid, clear auth
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      setToken(response.token);
      setUser(response.user);
      
      // Store in localStorage
      localStorage.setItem('eventsync_token', response.token);
      localStorage.setItem('eventsync_user', JSON.stringify(response.user));
      
      toast.success('Connexion réussie');
    } catch (error: any) {
      const message = error.response?.message || error.message || 'Erreur de connexion';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      setToken(response.token);
      setUser(response.user);
      
      // Store in localStorage
      localStorage.setItem('eventsync_token', response.token);
      localStorage.setItem('eventsync_user', JSON.stringify(response.user));
      
      toast.success('Inscription réussie');
    } catch (error: any) {
      const message = error.response?.message || error.message || 'Erreur d\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eventsync_token');
    localStorage.removeItem('eventsync_user');
    toast.success('Déconnexion réussie');
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('eventsync_user', JSON.stringify(updatedUser));
      
      toast.success('Profil mis à jour');
    } catch (error: any) {
      const message = error.response?.message || error.message || 'Erreur de mise à jour';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};