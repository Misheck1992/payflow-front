import { authService } from '@/services/authService';

export interface DeductionProcessingRecord {
  id: string;
  institution_id: string;
  deduction_request_id: string;
  payroll_period_id: string;
  employee_id: string;
  scheduled_amount: number;
  actual_amount: number;
  processing_status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'FAILED' | 'CANCELLED';
  processing_date: string;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  employee: {
    employee_number: string;
    name: string;
    email: string;
    phone: string;
    basic_salary?: number; // Only in institution endpoint
  };
  institution: {
    name: string;
    code: string;
    type: string;
    contact_email: string;
  };
  deduction_request: {
    request_number: string;
    deduction_type: string;
    reason: string;
    external_reference: string;
    original_amount?: number; // Only in institution endpoint
  };
  requester: {
    name: string;
    code: string;
  };
  payroll_period: {
    period_name: string;
    start_date: string;
    end_date: string;
    pay_date: string;
    status?: string; // Only in institution endpoint
  };
  processed_by?: {
    name: string; // Only in hub endpoint
    username: string; // Only in hub endpoint
  };
}

export interface DeductionProcessingSummary {
  total_records: number;
  pending_records: number;
  approved_records: number;
  processed_records: number;
  failed_records: number;
  cancelled_records: number;
  total_scheduled_amount: number;
  total_actual_amount: number;
  total_institutions?: number; // Only in hub endpoint
  total_employees: number;
  total_requesters?: number; // Only in institution endpoint
}

export interface DeductionProcessingFilters {
  processing_status?: string;
  institution_id?: string; // Only in hub endpoint
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  page?: number;
}

export interface DeductionProcessingResponse {
  success: boolean;
  message: string;
  data: {
    records: DeductionProcessingRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    summary: DeductionProcessingSummary;
    filters: {
      processing_status?: string;
      institution_id?: string;
      employee_id?: string;
      start_date?: string;
      end_date?: string;
      available_statuses: string[];
    };
  };
}

class DeductionProcessingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token for deduction processing:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }

  // For Hub/Super Admin - view all records across all institutions
  async getAllDeductionProcessingRecords(filters: DeductionProcessingFilters = {}): Promise<DeductionProcessingResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.processing_status) queryParams.append('processing_status', filters.processing_status);
      if (filters.institution_id) queryParams.append('institution_id', filters.institution_id);
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${this.baseUrl}/api/deduction-processing/records/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const token = this.getAuthToken();

      console.log('Fetching all deduction processing records from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: DeductionProcessingResponse = await authService.handleApiResponse(response);
      console.log('Fetched all deduction processing records:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('Error fetching all deduction processing records:', error);
      throw error;
    }
  }

  // For Employers - view records where they are the employer
  async getEmployerDeductionProcessingRecords(filters: DeductionProcessingFilters = {}): Promise<DeductionProcessingResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.processing_status) queryParams.append('processing_status', filters.processing_status);
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${this.baseUrl}/api/deduction-processing/records${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const token = this.getAuthToken();

      console.log('Fetching employer deduction processing records from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: DeductionProcessingResponse = await authService.handleApiResponse(response);
      console.log('Fetched employer deduction processing records:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('Error fetching employer deduction processing records:', error);
      throw error;
    }
  }

  // For SACCO/Financial Institutions - view records where they are the requesting institution
  async getSaccoDeductionProcessingRecords(filters: DeductionProcessingFilters = {}): Promise<DeductionProcessingResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.processing_status) queryParams.append('processing_status', filters.processing_status);
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${this.baseUrl}/api/deduction-processing/records/financial${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const token = this.getAuthToken();

      console.log('Fetching SACCO/financial deduction processing records from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: DeductionProcessingResponse = await authService.handleApiResponse(response);
      console.log('Fetched SACCO/financial deduction processing records:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('Error fetching SACCO/financial deduction processing records:', error);
      throw error;
    }
  }
}

export const deductionProcessingService = new DeductionProcessingService();