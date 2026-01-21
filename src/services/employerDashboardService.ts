// Employer Dashboard Service - handles Employer dashboard API calls
import { authService } from '@/services/authService';

export interface EmployerStats {
  overview: {
    current_batch: string;
    total_employees: number;
    active_employees: number;
    total_deduction_files: number;
    pending_approval_files: number;
    total_deduction_requests: number;
    total_departments: number;
    total_positions: number;
  };
  employees: {
    total: number;
    active: number;
    inactive: number;
    terminated: number;
    departments_with_employees: number;
    positions_with_employees: number;
    average_salary: number;
    total_payroll: number;
  };
  deduction_files: {
    total: number;
    pending_approval: number;
    approved: number;
    rejected: number;
    current_batch_files: number;
    pending_approval_value: number;
    approved_value: number;
    total_value: number;
    unique_saccos: number;
    approval_rate: string;
  };
  deduction_requests: {
    total_for_employer: number;
    pending_for_employer: number;
    approved_for_employer: number;
    rejected_for_employer: number;
    active_for_employer: number;
    total_amount_for_employer: number;
    unique_saccos_requesting: number;
    employees_with_requests: number;
    sacco_breakdown: Array<{
      sacco_id: string;
      sacco_name: string;
      requests_count: number;
      approved_amount: number;
    }>;
  };
  batch_processing: {
    current_batch_code: string;
    total_processing_records: number;
    current_batch_records: number;
    total_scheduled_amount: number;
    current_batch_amount: number;
    total_actual_amount: number;
    pending_processing: number;
    approved_processing: number;
    processed_records: number;
    failed_processing: number;
    saccos_in_processing: number;
  };
  departments: {
    total: number;
    active: number;
    inactive: number;
    total_employees_in_departments: number;
    active_employees_in_departments: number;
  };
  positions: {
    total: number;
    active: number;
    inactive: number;
    total_employees_in_positions: number;
    active_employees_in_positions: number;
  };
  payments: {
    total_payment_files: number;
    current_batch_payment_files: number;
    saccos_paid: number;
    total_amount_paid: number;
    current_batch_amount_paid: number;
    average_payment_amount: number;
  };
  recent_activity: {
    file_uploads_last_7_days: number;
    file_approvals_last_7_days: number;
    deduction_requests_last_7_days: number;
    employees_added_last_30_days: number;
    processing_records_last_7_days: number;
  };
  financial_summary: {
    approved_file_value: number;
    pending_file_value: number;
    total_file_value: number;
    approved_request_value: number;
    pending_request_value: number;
    total_scheduled_value: number;
    total_actual_value: number;
    current_batch_scheduled_value: number;
    current_batch_actual_value: number;
    total_payments_value: number;
    current_batch_payments_value: number;
  };
}

export interface EmployerBatchPerformance {
  batches: Array<{
    batch_code: string;
    total_records: number;
    total_scheduled: number;
    total_actual: number;
    processed_count: number;
    failed_count: number;
    saccos_count: number;
    batch_start_date: string;
    batch_last_update: string;
    success_rate: string;
    amount_variance: number;
  }>;
  summary: {
    total_batches_analyzed: number;
    average_records_per_batch: number;
  };
}

export interface EmployerStatsResponse {
  success: boolean;
  message: string;
  data: EmployerStats;
  timestamp: string;
}

export interface EmployerBatchPerformanceResponse {
  success: boolean;
  message: string;
  data: EmployerBatchPerformance;
  timestamp: string;
}

class EmployerDashboardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token for Employer dashboard:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }

  // Get Employer dashboard statistics
  async getEmployerStats(): Promise<EmployerStats> {
    try {
      const url = `${this.baseUrl}/api/employer-stats/dashboard`;
      const token = this.getAuthToken();

      console.log('Fetching Employer stats from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: EmployerStatsResponse = await authService.handleApiResponse(response);

      console.log('Fetched Employer stats:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch Employer statistics');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching Employer stats:', error);
      throw error;
    }
  }

  // Get Employer batch performance statistics
  async getEmployerBatchPerformance(limit: number = 10): Promise<EmployerBatchPerformance> {
    try {
      const url = `${this.baseUrl}/api/employer-stats/batch-performance?limit=${limit}`;
      const token = this.getAuthToken();

      console.log('Fetching Employer batch performance from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: EmployerBatchPerformanceResponse = await authService.handleApiResponse(response);

      console.log('Fetched Employer batch performance:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch Employer batch performance');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching Employer batch performance:', error);
      throw error;
    }
  }
}

export const employerDashboardService = new EmployerDashboardService();