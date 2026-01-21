// Department Service - handles department API calls
import { authService } from '@/services/authService';

export interface Department {
  id: string;
  institution_id: string;
  department_code: string;
  department_name: string;
  description: string;
  parent_department_id: string | null;
  department_head_id: string | null;
  location: string | null;
  cost_center: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  employee_count?: number;
}

export interface CreateDepartmentRequest {
  department_code: string;
  department_name: string;
  description: string;
  location: string;
}

export interface DepartmentsApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    departments: Department[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface CreateDepartmentApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Department;
}

class DepartmentService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('DepartmentService initialized with baseUrl:', this.baseUrl);
  }

  async getDepartments(): Promise<Department[]> {
    try {
      const url = `${this.baseUrl}/api/departments`;
      console.log('Fetching departments from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      const apiResponse: DepartmentsApiResponse = await authService.handleApiResponse(response);
      console.log('Fetched departments data:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch departments');
      }

      return apiResponse.data.departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    try {
      const url = `${this.baseUrl}/api/departments`;
      console.log('Creating department at:', url, 'with data:', departmentData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      console.log('Response status:', response.status);

      const apiResponse: CreateDepartmentApiResponse = await authService.handleApiResponse(response);
      console.log('Created department data:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to create department');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  async updateDepartment(departmentId: string, departmentData: Partial<CreateDepartmentRequest>): Promise<Department> {
    try {
      const url = `${this.baseUrl}/api/departments/${departmentId}`;
      console.log('Updating department at:', url, 'with data:', departmentData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      console.log('Response status:', response.status);

      const apiResponse: CreateDepartmentApiResponse = await authService.handleApiResponse(response);
      console.log('Updated department data:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to update department');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/departments/${departmentId}`;
      console.log('Deleting department at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      const apiResponse = await authService.handleApiResponse(response);
      console.log('Delete department response:', apiResponse);

      // Check if the API response indicates success (if it returns a JSON response)
      if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse && !apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
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
export const departmentService = new DepartmentService();