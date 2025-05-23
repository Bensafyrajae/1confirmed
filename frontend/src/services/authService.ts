import { apiService } from '@/services/apiService';
import { User, LoginData, RegisterData, ApiResponse } from '@/types';

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', data);
    
    if (response.token) {
      apiService.setAuthToken(response.token);
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    
    if (response.token) {
      apiService.setAuthToken(response.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiService.post<ApiResponse<null>>('/auth/logout');
      apiService.removeAuthToken();
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local token
      apiService.removeAuthToken();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ success: boolean; user: User }>('/auth/me');
    return response.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<{ success: boolean; user: User }>('/auth/profile', data);
    return response.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return apiService.put<ApiResponse<null>>('/auth/password', {
      currentPassword,
      newPassword,
    });
  }

  async resetPassword(email: string): Promise<ApiResponse<null>> {
    return apiService.post<ApiResponse<null>>('/auth/reset-password', { email });
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<ApiResponse<null>> {
    return apiService.post<ApiResponse<null>>('/auth/confirm-reset', {
      token,
      newPassword,
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    return apiService.post<ApiResponse<null>>('/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<ApiResponse<null>> {
    return apiService.post<ApiResponse<null>>('/auth/resend-verification');
  }

  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }

  getToken(): string | null {
    return apiService.getAuthToken();
  }
}

export const authService = new AuthService();
export default authService;