// Role Management Service - handles role management API calls
import { authService } from '@/services/authService';

export interface Role {
  id: string;
  role_name: string;
  role_code: string;
  description: string;
  permissions: Record<string, string[]> | {};
  institution_id: string;
  is_custom: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  role_name: string;
  role_code: string;
  description: string;
  institution_id: string;
  permissions: Record<string, string[]> | {};
}

export interface RolesApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    roles: Role[];
  };
}

export interface CreateRoleApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    role: Role;
  };
}

class RoleManagementService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('RoleManagementService initialized with baseUrl:', this.baseUrl);
  }

  async getInstitutionRoles(): Promise<Role[]> {
    try {
      const url = `${this.baseUrl}/api/role-management/institution-roles`;
      console.log('Fetching institution roles from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const apiResponse: RolesApiResponse = await authService.handleApiResponse(response);
      console.log('Institution roles response:', apiResponse);

      return apiResponse.data.roles;
    } catch (error) {
      console.error('Error fetching institution roles:', error);
      throw error;
    }
  }

  async createCustomRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      const url = `${this.baseUrl}/api/roles`;
      console.log('Creating custom role at:', url, 'with data:', roleData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      const apiResponse: CreateRoleApiResponse = await authService.handleApiResponse(response);
      console.log('Create role response:', apiResponse);

      return apiResponse.data.role;
    } catch (error) {
      console.error('Error creating custom role:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }
}

// Export singleton instance
export const roleManagementService = new RoleManagementService();