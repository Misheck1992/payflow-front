export interface EnumOption {
  value: string;
  label: string;
}

class EnumService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134';

  constructor() {
    console.log('EnumService initialized with baseUrl:', this.baseUrl);
  }

  async getGenderTypes(): Promise<EnumOption[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/Enums/gender-types`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gender types');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gender types:', error);
      return [
        { value: 'MALE', label: 'MALE' },
        { value: 'FEMALE', label: 'FEMALE' },
        { value: 'OTHER', label: 'OTHER' }
      ];
    }
  }

  async getMaritalStatuses(): Promise<EnumOption[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/Enums/marital-statuses`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch marital statuses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching marital statuses:', error);
      return [
        { value: 'SINGLE', label: 'SINGLE' },
        { value: 'MARRIED', label: 'MARRIED' },
        { value: 'DIVORCED', label: 'DIVORCED' },
        { value: 'WIDOWED', label: 'WIDOWED' }
      ];
    }
  }

  async getEmployeeStatuses(): Promise<EnumOption[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/Enums/employee-statuses`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employee statuses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching employee statuses:', error);
      return [
        { value: 'EMPLOYER', label: 'EMPLOYER' },
        { value: 'SACCO', label: 'SACCO' },
        { value: 'FINANCIAL_INSTITUTION', label: 'FINANCIAL INSTITUTION' },
        { value: 'HYBRID', label: 'HYBRID' }
      ];
    }
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }
}

export const enumService = new EnumService();