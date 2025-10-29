import { apiService } from './api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
  role?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export const authService = {
  async register(user: UserCreate): Promise<User | null> {
    const response = await apiService.post<User>('/auth/register', user);
    return response.data || null;
  },

  async login(email: string, password: string): Promise<Token | null> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return null;
    }

    const token: Token = await response.json();
    apiService.setAuthToken(token.access_token);
    return token;
  },

  async getCurrentUser(): Promise<User | null> {
    const response = await apiService.get<User>('/auth/me');
    return response.data || null;
  },

  logout(): void {
    apiService.clearAuthToken();
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
