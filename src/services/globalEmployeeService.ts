// Global Employee Search Service - for searching employees across all institutions

export interface GlobalEmployee {
  id: string;
  institutionId: string;
  employeeNumber: string;
  nationalId: string;
  passportNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  email: string;
  phoneNumber: string;
  physicalAddress: string;
  postalAddress: string;
  nationality: string;
  employmentDate: string;
  employeeType: string;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionTitle: string;
  supervisorId: string;
  supervisorName: string;
  basicSalary: number;
  contractStartDate: string;
  contractEndDate: string;
  taxNumber: string;
  pensionNumber: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  createdAt: string;
  updatedAt: string;
  employerInstitutionName: string;
  employerInstitutionCode: string;
  employerInstitutionType: string;
}

class GlobalEmployeeService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134';

  constructor() {
    console.log('GlobalEmployeeService initialized with baseUrl:', this.baseUrl);
  }

  async searchEmployeeByNumber(employeeNumber: string): Promise<GlobalEmployee[]> {
    try {
      const url = `${this.baseUrl}/api/Employees/global/number/${employeeNumber}`;
      console.log('Searching global employee by number from:', url);
      
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
        throw new Error(`Failed to search employee: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Found employee data:', data);
      return data;
    } catch (error) {
      console.error('Error searching employee:', error);
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
export const globalEmployeeService = new GlobalEmployeeService();
