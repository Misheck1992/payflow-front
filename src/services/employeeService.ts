// Employee service for PayFlow Malawi - handles employee API calls
import { authService } from '@/services/authService';

export interface Employee {
  id: string;
  institution_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department_id: string;
  position_id: string;
  employment_date: string;
  basic_salary: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  // Related data from API
  department?: {
    id: string;
    department_name: string;
    department_code: string;
  };
  position?: {
    id: string;
    position_title: string;
    position_code: string;
    salary_grade: string;
  };
  // Computed properties for UI
  full_name?: string;
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department_id: string;
  position_id: string;
  employment_date: string;
  basic_salary: number;
}

export interface EmployeesApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    employees: Employee[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface CreateEmployeeApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Employee;
}

class EmployeeService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('EmployeeService initialized with baseUrl:', this.baseUrl);
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      const url = `${this.baseUrl}/api/employees`;
      console.log('Fetching employees from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Employees response status:', response.status);

      const apiResponse: EmployeesApiResponse = await authService.handleApiResponse(response);
      console.log('Fetched employees data:', apiResponse);

      // Add computed properties to employees
      const employeesWithComputed = apiResponse.data.employees.map(employee => ({
        ...employee,
        full_name: `${employee.first_name} ${employee.last_name}`.trim()
      }));

      return employeesWithComputed;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  async getEmployeeById(employeeId: string): Promise<Employee> {
    try {
      const url = `${this.baseUrl}/api/employees/${employeeId}`;
      console.log('Fetching employee by ID from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Employee response status:', response.status);
      
      const apiResponse: SingleEmployeeApiResponse = await authService.handleApiResponse(response);
      console.log('Fetched employee data:', apiResponse);

      // Handle wrapped response format {success: true, data: {...}}
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }

      // Fallback to direct response for backward compatibility
      return apiResponse;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  async createEmployee(employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      const url = `${this.baseUrl}/api/employees`;
      console.log('Creating employee at:', url, 'with data:', employeeData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      console.log('Create employee response status:', response.status);

      const apiResponse: CreateEmployeeApiResponse = await authService.handleApiResponse(response);
      console.log('Created employee data:', apiResponse);

      // Add computed properties
      const employeeWithComputed = {
        ...apiResponse.data,
        full_name: `${apiResponse.data.first_name} ${apiResponse.data.last_name}`.trim()
      };

      return employeeWithComputed;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async updateEmployee(employeeId: string, employeeData: Partial<CreateEmployeeRequest>): Promise<Employee> {
    try {
      const url = `${this.baseUrl}/api/employees/${employeeId}`;
      console.log('Updating employee at:', url, 'with data:', employeeData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      console.log('Update employee response status:', response.status);

      const apiResponse: CreateEmployeeApiResponse = await authService.handleApiResponse(response);
      console.log('Updated employee data:', apiResponse);

      // Add computed properties
      const employeeWithComputed = {
        ...apiResponse.data,
        full_name: `${apiResponse.data.first_name} ${apiResponse.data.last_name}`.trim()
      };

      return employeeWithComputed;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/employees/${employeeId}`;
      console.log('Deleting employee at:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Delete employee response status:', response.status);
      
      await authService.handleApiResponse(response);
      console.log('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
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
export const employeeService = new EmployeeService();
