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
  member_id: string;
  employer_institution_id: string;
  deduction_type: string;
  amount: number;
  external_reference?: string;
  reason: string;
  start_date: string;
  end_date?: string;
  number_of_installments: number;
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
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134';

  constructor() {
    console.log('DeductionRequestService initialized with baseUrl:', this.baseUrl);
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

      const request = apiResponse.data?.request || apiResponse;
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
