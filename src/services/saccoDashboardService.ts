// SACCO Dashboard Service - handles SACCO dashboard API calls
import { authService } from '@/services/authService';

export interface SaccoStats {
  overview: {
    current_batch: string;
    total_employer_payments: number;
    current_batch_payments: number;
    total_deduction_requests: number;
    active_employees: number;
    total_amount_received: number;
  };
  employer_payments: {
    total_files: number;
    current_batch_files: number;
    unique_employers: number;
    total_amount: number;
    current_batch_amount: number;
    average_payment_amount: number;
  };
  deduction_requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    active_approved: number;
    total_amount: number;
    unique_employers: number;
    unique_employees: number;
    approval_rate: string;
  };
  employees: {
    total_employees_with_requests: number;
    employees_with_approved_requests: number;
    employees_with_pending_requests: number;
    employer_institutions_served: number;
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
  };
  payment_files: {
    total_payment_files: number;
    payment_days: number;
    first_payment_date: string;
    latest_payment_date: string;
    employers_served: number;
  };
  recent_activity: {
    payment_files_last_7_days: number;
    deduction_requests_last_7_days: number;
    approvals_last_7_days: number;
    processing_records_last_7_days: number;
  };
  financial_summary: {
    total_payments_received: number;
    current_batch_payments: number;
    total_approved_amount: number;
    total_pending_amount: number;
    current_batch_scheduled: number;
    current_batch_actual: number;
  };
}

export interface SaccoBatchPerformance {
  batches: Array<{
    batch_code: string;
    total_records: number;
    total_scheduled: number;
    total_actual: number;
    processed_count: number;
    failed_count: number;
    employers_count: number;
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

export interface SaccoStatsResponse {
  success: boolean;
  message: string;
  data: SaccoStats;
  timestamp: string;
}

export interface SaccoBatchPerformanceResponse {
  success: boolean;
  message: string;
  data: SaccoBatchPerformance;
  timestamp: string;
}

class SaccoDashboardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token for SACCO dashboard:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }

  // Get SACCO dashboard statistics
  async getSaccoStats(): Promise<SaccoStats> {
    try {
      const url = `${this.baseUrl}/api/sacco-stats/dashboard`;
      const token = this.getAuthToken();

      console.log('Fetching SACCO stats from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: SaccoStatsResponse = await authService.handleApiResponse(response);

      console.log('Fetched SACCO stats:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch SACCO statistics');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching SACCO stats:', error);
      throw error;
    }
  }

  // Get SACCO batch performance statistics
  async getSaccoBatchPerformance(limit: number = 10): Promise<SaccoBatchPerformance> {
    try {
      const url = `${this.baseUrl}/api/sacco-stats/batch-performance?limit=${limit}`;
      const token = this.getAuthToken();

      console.log('Fetching SACCO batch performance from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: SaccoBatchPerformanceResponse = await authService.handleApiResponse(response);

      console.log('Fetched SACCO batch performance:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch SACCO batch performance');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching SACCO batch performance:', error);
      throw error;
    }
  }
}

export const saccoDashboardService = new SaccoDashboardService();