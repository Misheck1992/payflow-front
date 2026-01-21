// Affordability Check Service - handles affordability check API calls

export interface AffordabilityCheckResponse {
  isAffordable: boolean;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  basicSalary: number;
  requestedAmount: number;
  existingDeductions: number;
  totalDeductions: number;
  affordabilityLimit: number;
  affordabilityThreshold: number;
  utilizationPercentage: number;
  availableAmount: number;
  reasonIfNotAffordable: string | null;
}

export interface EmployeeSearchResult {
  id: string;
  employeeNumber: string;
  fullName: string;
  departmentName: string | null;
  positionTitle: string | null;
  isActive: boolean;
}

export interface Employee {
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
  gender: string;
  maritalStatus: string;
  email: string;
  phoneNumber: string;
  physicalAddress: string;
  postalAddress: string;
  nationality: string;
  employmentDate: string;
  employeeType: string;
  employmentStatus: string;
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

class AffordabilityService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134';

  constructor() {
    console.log('AffordabilityService initialized with baseUrl:', this.baseUrl);
  }

  async searchEmployees(institutionId: string, searchTerm: string): Promise<EmployeeSearchResult[]> {
    try {
      const url = `${this.baseUrl}/api/Employees/global/number/${searchTerm}`;
      console.log('Searching employees from:', url);
      
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
        throw new Error(`Failed to search employees: ${response.status} ${errorText}`);
      }
      
      const data: Employee[] = await response.json();
      console.log('Employee search results:', data);
      console.log('Employment statuses:', data.map(emp => emp.employmentStatus));
      
      // Transform Employee[] to EmployeeSearchResult[]
      const searchResults: EmployeeSearchResult[] = data.map(employee => ({
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName,
        departmentName: employee.departmentName,
        positionTitle: employee.positionTitle,
        isActive: employee.employmentStatus === 'ACTIVE'
      }));
      
      return searchResults;
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  async searchEmployeeByNumber(employeeNumber: string): Promise<Employee[]> {
    try {
      const url = `${this.baseUrl}/api/Employees/global/number/${employeeNumber}`;
      console.log('Searching employee by number from:', url);
      
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
      console.log('Employee search results:', data);
      return data;
    } catch (error) {
      console.error('Error searching employee:', error);
      throw error;
    }
  }

  async checkAffordability(employeeId: string, amount: number): Promise<AffordabilityCheckResponse> {
    try {
      const url = `${this.baseUrl}/api/DeductionRequests/employee/${employeeId}/affordability/${amount}`;
      console.log('Checking affordability from:', url);
      
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
        throw new Error(`Failed to check affordability: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Affordability check result:', data);
      return data;
    } catch (error) {
      console.error('Error checking affordability:', error);
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
export const affordabilityService = new AffordabilityService();
