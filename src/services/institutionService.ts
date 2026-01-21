import { Institution } from '@/lib/mockData';

// API Service for Institution Management
// This service handles all institution-related API calls

export interface InstitutionUser {
  id: string;
  institution_id: string;
  username: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  status: string;
  last_login: string | null;
  failed_login_attempts: number;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  role?: {
    id: string;
    name: string;
    code: string;
  };
  institution: {
    id: string;
    name: string;
  };
  // Computed properties for compatibility
  fullName: string;
  institutionId: string;
  roleName: string;
  lockedUntil: string | null;
  roleId: string;
}

export interface InstitutionDepartment {
  id: string;
  institutionId: string;
  departmentCode: string;
  departmentName: string;
  description: string;
  parentDepartmentId: string | null;
  parentDepartmentName: string | null;
  location: string;
  costCenter: string;
  createdAt: string;
  updatedAt: string;
  employeeCount: number;
  subDepartmentCount: number;
}

export interface CreateDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  description: string;
  parentDepartmentId?: string | null;
  location: string;
  costCenter: string;
}

// API endpoints defined in the Postman collection

export interface CreateInstitutionRequest {
  institutionCode: string;
  institutionName: string;
  institutionType: 'EMPLOYER' | 'SACCO' | 'FINANCIAL_INSTITUTION' | 'HYBRID' | 'HUB';
  registrationNumber?: string;
  taxNumber?: string;
  physicalAddress?: string;
  postalAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PENDING';
}

export interface UpdateInstitutionRequest {
  institutionName?: string;
  physicalAddress?: string;
  postalAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PENDING';
}

export interface SearchInstitutionRequest {
  institutionName?: string;
  institutionCode?: string;
  registrationNumber?: string;
  institutionType?: 'EMPLOYER' | 'SACCO' | 'FINANCIAL_INSTITUTION' | 'HYBRID' | 'HUB';
  page?: number;
  limit?: number;
}

export interface InstitutionResponse {
  id: string;
  institution_code: string;
  institution_name: string;
  institution_type: 'EMPLOYER' | 'SACCO' | 'FINANCIAL_INSTITUTION' | 'HYBRID' | 'HUB';
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PENDING';
  registration_number: string | null;
  tax_number: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  physical_address: string | null;
  postal_address: string | null;
  website: string | null;
  logo_url: string | null;
  settings: Record<string, any>;
  features_enabled: Record<string, any>;
}

// New interface for the API response structure
export interface InstitutionsApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    data: InstitutionResponse[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface InstitutionDetailsResponse {
  id: string;
  institutionCode: string;
  institutionName: string;
  institutionType: string | null;
  status: string | null;
  registrationNumber: string;
  taxNumber: string | null;
  contactEmail: string;
  contactPhone: string;
  physicalAddress: string;
  postalAddress: string | null;
  website: string | null;
  logoUrl: string | null;
  featuresEnabled: Record<string, any>;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
  totalEmployees: number;
  activeEmployees: number;
  totalDeductionRequests: number;
  pendingDeductionRequests: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InstitutionType {
  value: string;
  label: string;
}

export interface InstitutionStatus {
  value: string;
  label: string;
}

export interface InstitutionRole {
  id: string;
  institution_id: string;
  role_name: string;
  role_code: string;
  description: string;
  permissions: Record<string, string[]> | {};
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  role_name: string;
  role_code: string;
  description: string;
  permissions: Record<string, string[]> | {};
}

export interface CreateUserRequest {
  email: string;
  phoneNumber?: string | null;
  firstName: string;
  lastName: string;
  middleName?: string;
  password: string;
  roleId: string;
  isSuperAdmin: boolean;
}

export interface UsersApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    data: InstitutionUser[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface NewUsersApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    users: InstitutionUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface InstitutionDepartment {
  id: string;
  institutionId: string;
  departmentCode: string;
  departmentName: string;
  description: string;
  parentDepartmentId: string | null;
  parentDepartmentName: string | null;
  location: string;
  costCenter: string;
  createdAt: string;
  updatedAt: string;
  employeeCount: number;
  subDepartmentCount: number;
}

export interface CreateDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  description: string;
  parentDepartmentId?: string | null;
  location: string;
  costCenter: string;
}

class InstitutionService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('InstitutionService initialized with baseUrl:', this.baseUrl);
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  }

  async getAllInstitutions(): Promise<InstitutionResponse[]> {
    try {
      const url = `${this.baseUrl}/api/institutions`;
      console.log('Fetching institutions from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch institutions: ${response.status} ${errorText}`);
      }

      const apiResponse: InstitutionsApiResponse = await response.json();
      console.log('Fetched institutions data:', apiResponse);

      // Return the institutions data from the nested structure
      return apiResponse.data.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  }

  async getInstitutionById(institutionId: string): Promise<InstitutionResponse> {
    try {
      const url = `${this.baseUrl}/api/institutions/${institutionId}`;
      console.log('Fetching institution by ID from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch institution: ${response.status} ${errorText}`);
      }
      
      const apiResponse = await response.json();
      console.log('Fetched institution data:', apiResponse);

      // Handle wrapped response format {success: true, data: {...}}
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }

      // Fallback to direct response for backward compatibility
      return apiResponse;
    } catch (error) {
      console.error('Error fetching institution:', error);
      throw error;
    }
  }

  async getInstitutionDetails(institutionId: string): Promise<InstitutionDetailsResponse> {
    try {
      const url = `${this.baseUrl}/api/Institutions/${institutionId}/details`;
      console.log('Fetching institution details from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch institution details: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched institution details:', data);
      return data;
    } catch (error) {
      console.error('Error fetching institution details:', error);
      throw error;
    }
  }

  async searchInstitutions(searchParams: SearchInstitutionRequest): Promise<PaginatedResponse<InstitutionResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/institutions/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) {
        throw new Error('Failed to search institutions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching institutions:', error);
      throw error;
    }
  }

  async createInstitution(institutionData: CreateInstitutionRequest): Promise<InstitutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/institutions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institutionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create institution');
      }

      const apiResponse = await response.json();
      console.log('Create institution response:', apiResponse);

      // Handle wrapped response format {success: true, data: {...}}
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }

      // Fallback to direct response for backward compatibility
      return apiResponse;
    } catch (error) {
      console.error('Error creating institution:', error);
      throw error;
    }
  }

  async updateInstitution(institutionId: string, updateData: UpdateInstitutionRequest): Promise<InstitutionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/institutions/${institutionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update institution');
      }

      const apiResponse = await response.json();
      console.log('Update institution response:', apiResponse);

      // Handle wrapped response format {success: true, data: {...}}
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }

      // Fallback to direct response for backward compatibility
      return apiResponse;
    } catch (error) {
      console.error('Error updating institution:', error);
      throw error;
    }
  }

  async deleteInstitution(institutionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/institutions/${institutionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete institution');
      }
    } catch (error) {
      console.error('Error deleting institution:', error);
      throw error;
    }
  }

  async getInstitutionStatistics(institutionId?: string): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    totalDeductions: number;
    monthlyVolume: number;
  }> {
    try {
      const url = institutionId 
        ? `${this.baseUrl}/api/institutions/${institutionId}/statistics`
        : `${this.baseUrl}/api/institutions/statistics`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  async activateInstitution(institutionId: string): Promise<InstitutionResponse> {
    return this.updateInstitution(institutionId, { status: 'ACTIVE' });
  }

  async deactivateInstitution(institutionId: string): Promise<InstitutionResponse> {
    return this.updateInstitution(institutionId, { status: 'SUSPENDED' });
  }

  async getInstitutionTypes(): Promise<InstitutionType[]> {
    // Return static fallback data instead of making API call
    return [
      { value: 'EMPLOYER', label: 'Employer' },
      { value: 'SACCO', label: 'SACCO' },
      { value: 'FINANCIAL_INSTITUTION', label: 'Financial Institution' },
      { value: 'HYBRID', label: 'Hybrid' },
      { value: 'HUB', label: 'Hub' }
    ];
  }

  async getInstitutionStatuses(): Promise<InstitutionStatus[]> {
    // Return static fallback data instead of making API call
    return [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'SUSPENDED', label: 'Suspended' },
      { value: 'TERMINATED', label: 'Terminated' },
      { value: 'PENDING', label: 'Pending' }
    ];
  }

  async getInstitutionRoles(institutionId: string): Promise<InstitutionRole[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/roles/institution/${institutionId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch institution roles');
      }

      const apiResponse = await response.json();
      console.log('Fetched institution roles:', apiResponse);

      // Handle wrapped response format {success: true, data: [...]}
      const rolesData = apiResponse.success && apiResponse.data ? apiResponse.data : apiResponse;

      // Transform the API response to match the expected interface
      return rolesData.map((role: any) => ({
        id: role.id,
        institution_id: role.institution_id,
        role_name: role.role_name,
        role_code: role.role_code,
        description: role.description,
        permissions: role.permissions,
        is_custom: !!role.is_custom,
        created_at: role.created_at,
        updated_at: role.updated_at
      }));
    } catch (error) {
      console.error('Error fetching institution roles:', error);
      throw error;
    }
  }

  async createRole(institutionId: string, roleData: CreateRoleRequest): Promise<InstitutionRole> {
    try {
      // Include institution_id in the request body as required by the API
      const requestBody = {
        ...roleData,
        institution_id: institutionId
      };

      const response = await fetch(`${this.baseUrl}/api/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      const apiResponse = await response.json();
      console.log('Create role response:', apiResponse);

      // Handle wrapped response format {success: true, data: {...}}
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }

      // Fallback to direct response for backward compatibility
      return apiResponse;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async createUser(institutionId: string, userData: CreateUserRequest): Promise<InstitutionUser> {
    try {
      const url = `${this.baseUrl}/api/users`;
      console.log('Creating user at:', url);

      const requestBody = {
        institution_id: institutionId,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        role_id: userData.roleId,
        password: userData.password
      };

      // Add optional fields only if they have values
      if (userData.middleName?.trim()) {
        requestBody.middle_name = userData.middleName;
      }
      if (userData.phoneNumber?.trim()) {
        requestBody.phone_number = userData.phoneNumber;
      }

      console.log('Request body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);

          // If it's a validation error with specific messages, extract them
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.join('\n');
            throw new Error(errorMessages);
          }

          // If there's a general message, use that
          if (errorData.message) {
            throw new Error(errorData.message);
          }

          // Fallback to status text
          throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
        } catch (parseError) {
          // If JSON parsing fails, fall back to text
          const errorText = await response.text();
          throw new Error(`Failed to create user: ${response.status} ${errorText}`);
        }
      }

      const apiResponse = await response.json();
      const user = apiResponse.data?.user || apiResponse;

      // Transform the response to match expected format
      return {
        ...user,
        fullName: `${user.first_name} ${user.last_name}`.trim(),
        institutionId: user.institution_id,
        roleName: user.role?.name || 'Unknown',
        roleId: user.role?.id || '',
        lockedUntil: user.status === 'ACTIVE' ? null : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getInstitutionUsers(institutionId: string, limit: number = 20, page: number = 1): Promise<InstitutionUser[]> {
    try {
      const url = `${this.baseUrl}/api/users/institution/${institutionId}?limit=${limit}&page=${page}`;
      console.log('Fetching institution users from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch institution users: ${response.status} ${errorText}`);
      }

      const apiResponse = await response.json();
      console.log('Fetched institution users:', apiResponse);

      // Handle wrapped response format {success: true, data: {...}}
      let usersArray = [];
      if (apiResponse.success && apiResponse.data) {
        usersArray = apiResponse.data.users || apiResponse.data.data || apiResponse.data || [];
      } else {
        usersArray = apiResponse.data?.users || apiResponse.data?.data || apiResponse.data || [];
      }

      // Transform the API response to add computed properties
      return usersArray
        .filter((user: any) => user && user.id) // Filter out any null/undefined users
        .map((user: any) => ({
          ...user,
          fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          institutionId: user.institution_id,
          roleName: user.role_name || user.role?.name || 'Unknown',
          roleId: user.role_id || user.role?.id || '',
          lockedUntil: user.locked_until,
          lastLogin: user.last_login,
          isSuperAdmin: !!user.is_super_admin
        }));
    } catch (error) {
      console.error('Error fetching institution users:', error);
      throw error;
    }
  }

  async resetUserPassword(institutionId: string, userId: string): Promise<{new_password: string; message: string}> {
    try {
      const url = `${this.baseUrl}/api/users/${userId}/reset-password`;
      console.log('Resetting user password at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);

          // If it's a validation error with specific messages, extract them
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.join('\n');
            throw new Error(errorMessages);
          }

          // If there's a general message, use that
          if (errorData.message) {
            throw new Error(errorData.message);
          }

          // Fallback to status text
          throw new Error(`Failed to reset password: ${response.status} ${response.statusText}`);
        } catch (parseError) {
          // If JSON parsing fails, fall back to text
          const errorText = await response.text();
          throw new Error(`Failed to reset password: ${response.status} ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('Password reset successful:', result);
      return result.data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  }

  async getInstitutionDepartments(institutionId: string): Promise<InstitutionDepartment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/departments?institutionId=${institutionId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch institution departments');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching institution departments:', error);
      throw error;
    }
  }

  async createDepartment(institutionId: string, departmentData: CreateDepartmentRequest): Promise<InstitutionDepartment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/departments?institutionId=${institutionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create department');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    // In a real app, get this from your auth context or localStorage
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }
}

// Export singleton instance
export const institutionService = new InstitutionService();

// Export utility functions for transforming data
export const transformToInstitution = (apiResponse: InstitutionResponse): Institution => {
  return {
    id: apiResponse.id,
    institutionCode: apiResponse.institution_code,
    name: apiResponse.institution_name,
    type: apiResponse.institution_type,
    registrationNumber: apiResponse.registration_number || '',
    address: apiResponse.physical_address || '',
    contactEmail: apiResponse.contact_email || '',
    contactPhone: apiResponse.contact_phone || '',
    isActive: apiResponse.status === 'ACTIVE'
  };
};

export const transformFromInstitution = (institution: Institution): CreateInstitutionRequest => {
  return {
    institutionCode: institution.institutionCode,
    institutionName: institution.name,
    institutionType: institution.type,
    registrationNumber: institution.registrationNumber,
    physicalAddress: institution.address,
    contactEmail: institution.contactEmail,
    contactPhone: institution.contactPhone,
    status: institution.isActive ? 'ACTIVE' : 'SUSPENDED'
  };
};
