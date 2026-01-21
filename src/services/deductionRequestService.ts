// Deduction Request Service - handles deduction request API calls

export interface DeductionType {
  value: string;
  label: string;
}

export interface DeductionRequest {
  id: string;
  institution_id: string;
  request_number: string;
  member_id: string;
  employee_id: string;
  employer_institution_id: string;
  deduction_type: string;
  amount: string;
  start_date: string;
  end_date: string | null;
  number_of_installments: number;
  remaining_installments: number;
  request_status: string;
  reason: string;
  external_reference: string | null;
  requested_at: string;
  requested_by: string;
  approved_at: string | null;
  approved_by: string | null;
  updated_at: string;
  // Employee information from API response
  employee?: {
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    basic_salary?: string;
  };
  // Computed properties for UI compatibility
  memberId: string;
  employeeId: string;
  employerInstitutionId: string;
  deductionType: string;
  numberOfInstallments: number;
  status: string;
  createdAt: string;
}

export interface CreateDeductionRequest {
  employee_id: string;
  employer_institution_id: string;
  deduction_type: string;
  amount: number;
  start_date: string;
  end_date?: string;
  number_of_installments: number;
  reason: string;
  external_reference?: string;
}

export interface Employee {
  id: string;
  institution_id: string;
  employee_number: string;
  national_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  email: string;
  phone_number?: string;
  employment_status: string;
  employment_date: string;
  basic_salary?: string;
  employer: {
    id: string;
  };
}

export interface EmployeeSearchResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    employees: Employee[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
    stats: {
      total_employees: number;
      total_employers: number;
      average_salary?: number;
      min_salary?: number;
      max_salary?: number;
    };
  };
}

export interface AffordabilityRequest {
  employee_id: string;
  requested_amount: number;
}

export interface AffordabilityResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    employee: {
      id: string;
      employee_number: string;
      full_name: string;
      employer_name: string;
    };
    salary_info: {
      basic_salary: number;
      monthly_salary: number;
    };
    existing_deductions: {
      total_amount: number;
      count: number;
      details: Array<{
        type: string;
        amount: number;
        institution: string;
      }>;
    };
    requested_deduction: {
      amount: number;
    };
    affordability_assessment: {
      basic_salary: number;
      existing_deductions: number;
      requested_amount: number;
      total_deductions: number;
      net_salary_current: number;
      net_salary_after_deduction: number;
      existing_deduction_percentage: number;
      requested_deduction_percentage: number;
      total_deduction_percentage: number;
      safe_deduction_limit: number;
      available_amount: number;
      can_afford: boolean;
      risk_score: number;
      risk_level: string;
      assessment_result: string;
    };
    assessment_date: string;
    recommendation: string;
  };
}

export interface DeductionRequestsApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    requests: DeductionRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
    stats: {
      total_requests: number;
      pending_requests: number;
      approved_requests: number;
      processed_requests: number;
      cancelled_requests: number;
      total_approved_amount: string;
      total_processed_amount: string;
    };
  };
}

export interface InstitutionMemberForDeduction {
  id: string;
  memberNumber: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  employerInstitutionId: string;
  employerInstitutionName: string;
  membershipStatus: string;
}

export interface PendingDeductionRequest {
  id: string;
  institutionId: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  memberId: string;
  memberNumber: string;
  employerInstitutionId: string;
  employerInstitutionName: string | null;
  deductionType: string;
  amount: number;
  externalReference: string;
  reason: string;
  startDate: string;
  endDate: string | null;
  numberOfInstallments: number;
  remainingInstallments: number;
  requestStatus: string;
  requestedAt: string;
  requestedBy: string | null;
  requestedByName: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  approvedByName: string | null;
}

// Note: Approval and rejection endpoints just accept a plain string comment

class DeductionRequestService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('DeductionRequestService initialized with baseUrl:', this.baseUrl);
  }

  async searchEmployees(query: string, limit: number = 50, page: number = 1, employerId?: string): Promise<Employee[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', limit.toString());
      params.append('page', page.toString());
      if (employerId) {
        params.append('employer_id', employerId);
      }

      const url = `${this.baseUrl}/api/deduction-requests/search/employees?${params.toString()}`;
      console.log('Searching employees at:', url);

      const response = await fetch(url, {
        method: 'GET',
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

      const apiResponse: EmployeeSearchResponse = await response.json();
      console.log('Employee search response:', apiResponse);
      return apiResponse.data.employees;
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  async checkAffordability(requestData: AffordabilityRequest): Promise<AffordabilityResponse> {
    try {
      const url = `${this.baseUrl}/api/deduction-requests/affordability`;
      console.log('Checking affordability at:', url, 'with data:', requestData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to check affordability: ${response.status} ${errorText}`);
      }

      const apiResponse: AffordabilityResponse = await response.json();
      console.log('Affordability check response:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('Error checking affordability:', error);
      throw error;
    }
  }

  async createDeductionRequest(requestData: CreateDeductionRequest): Promise<DeductionRequest> {
    try {
      const url = `${this.baseUrl}/api/deduction-requests`;
      console.log('Creating deduction request at:', url, 'with data:', requestData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to create deduction request: ${response.status} ${errorText}`);
      }

      const apiResponse = await response.json();
      console.log('Created deduction request data:', apiResponse);

      const request = apiResponse.data;
      return {
        ...request,
        memberId: request.member_id,
        employeeId: request.employee_id,
        employerInstitutionId: request.employer_institution_id,
        deductionType: request.deduction_type,
        numberOfInstallments: request.number_of_installments,
        status: request.request_status,
        createdAt: request.requested_at
      };
    } catch (error) {
      console.error('Error creating deduction request:', error);
      throw error;
    }
  }

  async getDeductionRequests(institutionId?: string): Promise<{ requests: DeductionRequest[], stats: any }> {
    try {
      const url = `${this.baseUrl}/api/deduction-requests`;
      console.log('Fetching deduction requests from:', url);

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
        throw new Error(`Failed to fetch deduction requests: ${response.status} ${errorText}`);
      }

      const apiResponse: DeductionRequestsApiResponse = await response.json();
      console.log('Fetched deduction requests data:', apiResponse);

      // Transform the API response to add computed properties
      const transformedRequests = apiResponse.data.requests.map(request => ({
        ...request,
        // Preserve employee information if it exists in the API response
        employee: (request as any).employee || undefined,
        memberId: request.member_id,
        employeeId: request.employee_id,
        employerInstitutionId: request.employer_institution_id,
        deductionType: request.deduction_type,
        numberOfInstallments: request.number_of_installments,
        status: request.request_status,
        createdAt: request.requested_at
      }));

      return {
        requests: transformedRequests,
        stats: apiResponse.data.stats
      };
    } catch (error) {
      console.error('Error fetching deduction requests:', error);
      throw error;
    }
  }

  // We'll reuse the institution members service for getting members
  // This is a helper method to get members formatted for deduction requests
  async getDeductionTypes(): Promise<DeductionType[]> {
    try {
      const url = `${this.baseUrl}/api/Enums/deduction-types`;
      console.log('Fetching deduction types from:', url);

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
        throw new Error(`Failed to fetch deduction types: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched deduction types data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching deduction types:', error);
      throw error;
    }
  }

  async getInstitutionMembersForDeduction(institutionId: string): Promise<InstitutionMemberForDeduction[]> {
    try {
      console.log('getInstitutionMembersForDeduction called with institutionId:', institutionId);

      // Import the service here to avoid circular dependency
      const { institutionMembersService } = await import('./institutionMembersService');
      console.log('About to call institutionMembersService.getInstitutionMembers with institutionId:', institutionId);

      const members = await institutionMembersService.getInstitutionMembers(institutionId);
      console.log('Raw members response:', members);

      // Transform to the format needed for deduction requests
      const transformedMembers = members.map(member => ({
        id: member.id,
        memberNumber: member.memberNumber,
        employeeId: member.employeeId,
        employeeName: member.employeeName,
        employeeNumber: member.employeeNumber,
        employerInstitutionId: member.employerInstitutionId,
        employerInstitutionName: member.employerInstitutionName,
        membershipStatus: member.membershipStatus
      }));

      console.log('Transformed members for deduction:', transformedMembers);
      return transformedMembers;
    } catch (error) {
      console.error('Error fetching members for deduction:', error);
      throw error;
    }
  }

  async getReceivedDeductionRequests(
    status?: string,
    type?: string,
    search?: string,
    limit: number = 50,
    page: number = 1,
    dueOnly?: boolean
  ): Promise<{ requests: DeductionRequest[], stats: any, pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      if (type) queryParams.append('type', type);
      if (search) queryParams.append('search', search);
      queryParams.append('limit', limit.toString());
      queryParams.append('page', page.toString());
      if (dueOnly) queryParams.append('due_only', 'true');

      const url = `${this.baseUrl}/api/deduction-requests/received?${queryParams.toString()}`;
      console.log('Fetching received deduction requests from:', url);

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
        throw new Error(`Failed to fetch received deduction requests: ${response.status} ${errorText}`);
      }

      const apiResponse: DeductionRequestsApiResponse = await response.json();
      console.log('Fetched received deduction requests data:', apiResponse);

      // Transform the API response to add computed properties
      const transformedRequests = apiResponse.data.requests.map(request => ({
        ...request,
        employee: (request as any).employee || undefined,
        memberId: request.member_id,
        employeeId: request.employee_id,
        employerInstitutionId: request.employer_institution_id,
        deductionType: request.deduction_type,
        numberOfInstallments: request.number_of_installments,
        status: request.request_status,
        createdAt: request.requested_at
      }));

      return {
        requests: transformedRequests,
        stats: apiResponse.data.stats,
        pagination: apiResponse.data.pagination
      };
    } catch (error) {
      console.error('Error fetching received deduction requests:', error);
      throw error;
    }
  }

  async getAllDueDeductions(
    employerId?: string,
    status: string = 'APPROVED',
    type?: string,
    search?: string,
    limit: number = 50,
    page: number = 1
  ): Promise<{ requests: DeductionRequest[], stats: any, pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (employerId) queryParams.append('employer_id', employerId);
      if (status) queryParams.append('status', status);
      if (type) queryParams.append('type', type);
      if (search) queryParams.append('search', search);
      queryParams.append('limit', limit.toString());
      queryParams.append('page', page.toString());

      const url = `${this.baseUrl}/api/deduction-requests/all-due?${queryParams.toString()}`;
      console.log('Fetching all due deduction requests from:', url);

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
        throw new Error(`Failed to fetch all due deduction requests: ${response.status} ${errorText}`);
      }

      const apiResponse: DeductionRequestsApiResponse = await response.json();
      console.log('Fetched all due deduction requests data:', apiResponse);

      // Transform the API response to add computed properties
      const transformedRequests = apiResponse.data.requests.map(request => ({
        ...request,
        employee: (request as any).employee || undefined,
        memberId: request.member_id,
        employeeId: request.employee_id,
        employerInstitutionId: request.employer_institution_id,
        deductionType: request.deduction_type,
        numberOfInstallments: request.number_of_installments,
        status: request.request_status,
        createdAt: request.requested_at
      }));

      return {
        requests: transformedRequests,
        stats: apiResponse.data.stats,
        pagination: apiResponse.data.pagination
      };
    } catch (error) {
      console.error('Error fetching all due deduction requests:', error);
      throw error;
    }
  }

  async getPendingDeductionRequests(employerInstitutionId: string): Promise<PendingDeductionRequest[]> {
    try {
      const url = `${this.baseUrl}/api/DeductionRequests/employer/${employerInstitutionId}/cross-institutional`;
      console.log('Fetching pending deduction requests from:', url);

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
        throw new Error(`Failed to fetch pending deduction requests: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched pending deduction requests data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching pending deduction requests:', error);
      throw error;
    }
  }

  async approveDeductionRequest(requestId: string, comment?: string): Promise<PendingDeductionRequest> {
    try {
      const url = `${this.baseUrl}/api/DeductionRequests/${requestId}/approve`;
      console.log('Approving deduction request at:', url, 'with comment:', comment);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment || ''),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to approve deduction request: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Approved deduction request data:', data);
      return data;
    } catch (error) {
      console.error('Error approving deduction request:', error);
      throw error;
    }
  }

  async rejectDeductionRequest(requestId: string, comment?: string): Promise<PendingDeductionRequest> {
    try {
      const url = `${this.baseUrl}/api/DeductionRequests/${requestId}/cancel`;
      console.log('Canceling deduction request at:', url, 'with comment:', comment);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment || ''),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to cancel deduction request: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Canceled deduction request data:', data);
      return data;
    } catch (error) {
      console.error('Error canceling deduction request:', error);
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
export const deductionRequestService = new DeductionRequestService();