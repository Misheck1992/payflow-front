// Authentication service for PayFlow Malawi
import { User } from '@/lib/mockData';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiUser {
  id: string;
  institution_id: string;
  username: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  status: string;
  last_login: string;
  failed_login_attempts: number;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: string;
    name: string;
    code: string;
    permissions: Record<string, any>;
  };
  institution: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ApiLoginResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    user: ApiUser;
    token: string;
    expires_in: string;
  };
}

export interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134';
  private readonly SUPER_ADMIN_INSTITUTION_ID = '00000000-0000-0000-0000-000000000000';

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const apiLoginData: ApiLoginResponse = await response.json();

      if (!apiLoginData.success || !apiLoginData.data?.user) {
        throw new Error(apiLoginData.message || 'Login failed');
      }

      // Convert API user to our User interface
      const user: User = this.convertApiUserToUser(apiLoginData.data.user);

      // Use the actual token from the API
      const token = apiLoginData.data.token;

      // Save token and user to localStorage immediately
      localStorage.setItem('payflow_token', token);
      localStorage.setItem('payflow_user', JSON.stringify(user));
      localStorage.setItem('payflow_institution_id', user.institutionId);

      console.log('AuthService: Login successful, saved to localStorage:', {
        userId: user.id,
        institutionId: user.institutionId,
        hasToken: !!token
      });

      return {
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private convertApiUserToUser(apiUser: ApiUser): User {
    // Map role name to our role enum
    const roleMapping: Record<string, any> = {
      'Super Admin': 'SUPER_ADMIN',
      'Super Administrator': 'SUPER_ADMIN',
      'Institution Administrator': 'EMPLOYER_ADMIN',
      'Employer Admin': 'EMPLOYER_ADMIN'
    };

    const mappedRole = roleMapping[apiUser.role.name] || 'EMPLOYER_ADMIN';
    const fullName = `${apiUser.first_name} ${apiUser.last_name}`.trim();

    return {
      id: apiUser.id,
      username: apiUser.username,
      email: apiUser.email,
      fullName: fullName,
      role: mappedRole,
      institutionId: apiUser.institution_id,
      institution: {
        id: apiUser.institution_id,
        institutionCode: '',
        name: apiUser.institution.name,
        type: apiUser.institution.type as any,
        registrationNumber: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        isActive: true
      },
      permissions: apiUser.is_super_admin ? ['*'] : [],
      lastLogin: apiUser.last_login ? new Date(apiUser.last_login) : undefined,
      isActive: apiUser.status === 'ACTIVE'
    };
  }

  logout(): void {
    // Clear ALL PayFlow-related localStorage data
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('payflow_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('AuthService logout - Cleared localStorage key:', key);
    });
    
    console.log('AuthService logout complete - All PayFlow data cleared');
  }

  setUser(user: User): void {
    localStorage.setItem('payflow_user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem('payflow_user');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.institutionId === this.SUPER_ADMIN_INSTITUTION_ID;
  }

  getAuthToken(): string {
    return localStorage.getItem('payflow_token') || '';
  }

  handleTokenExpiration(): void {
    console.log('Token expired, logging out and redirecting to login');
    this.logout();
    // Redirect to login page
    window.location.href = '/login';
  }

  async handleApiResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (errorData.message === 'Token expired' || response.status === 401) {
        this.handleTokenExpiration();
        throw new Error('Session expired. Please log in again.');
      }

      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  determineRedirectPath(user: User): string {
    // Redirect based on institution type
    if (user.institution.type === 'HUB') {
      // HUB users go to super admin dashboard with institution management
      console.log('Redirecting HUB user to super admin dashboard');
      return '/dashboard';
    } else if (user.institution.type === 'EMPLOYER') {
      // EMPLOYER users go to employer dashboard with HR modules
      console.log('Redirecting EMPLOYER user to employer dashboard');
      return '/dashboard';
    } else if (user.institution.type === 'SACCO') {
      // SACCO users go to SACCO dashboard
      console.log('Redirecting SACCO user to SACCO dashboard');
      return '/dashboard';
    } else {
      // Default fallback
      console.log('Redirecting user to default dashboard, institution type:', user.institution.type);
      return '/dashboard';
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
