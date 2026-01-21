// Hub Dashboard Service - handles hub dashboard API calls
import { authService } from '@/services/authService';

export interface HubStats {
  overview: {
    total_institutions: number;
    total_employers: number;
    total_saccos: number;
    total_financial_institutions: number;
    total_users: number;
    total_employees: number;
    current_batch: string;
  };
  institutions: {
    total: number;
    employers: number;
    saccos: number;
    financial_institutions: number;
    hybrid: number;
    active: number;
    inactive: number;
    suspended: number;
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
    approval_rate: string;
  };
  deduction_requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    active_approved: number;
    total_amount: number;
    unique_requesters: number;
    unique_employers: number;
    approval_rate: string;
  };
  employer_payments: {
    total_files: number;
    current_batch_files: number;
    unique_saccos: number;
    unique_employers: number;
    total_amount: number;
    current_batch_amount: number;
    average_payment_amount: number;
  };
  batch_processing: {
    current_batch_code: string;
    current_batch_records: number;
    current_batch_total: number;
    pending_processing: number;
    approved_processing: number;
    processed_records: number;
    failed_processing: number;
    total_batches: number;
    recent_batches: Array<{
      batch_code: string;
      batch_status: string;
      batch_date: string;
    }>;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    super_admins: number;
    institutions_with_users: number;
  };
  employees: {
    total: number;
    active: number;
    inactive: number;
    institutions_with_employees: number;
    total_departments: number;
    total_positions: number;
  };
  recent_activity: {
    files_uploaded_last_7_days: number;
    approvals_last_7_days: number;
    users_registered_last_30_days: number;
    institutions_registered_last_30_days: number;
  };
  financial_summary: {
    total_deduction_value: number;
    current_batch_value: number;
    processed_payments_value: number;
    pending_approvals_value: number;
  };
}

export interface BatchPerformance {
  batches: Array<{
    batch_code: string;
    batch_status: string;
    batch_date: string;
    total_records: number;
    total_amount: number;
    processed_count: number;
    failed_count: number;
    sacco_files_generated: number;
    sacco_payments_total: number;
    success_rate: string;
  }>;
  summary: {
    total_batches_analyzed: number;
    average_records_per_batch: number;
  };
}

export interface HubStatsResponse {
  success: boolean;
  message: string;
  data: HubStats;
  timestamp: string;
}

export interface BatchPerformanceResponse {
  success: boolean;
  message: string;
  data: BatchPerformance;
  timestamp: string;
}

class HubDashboardService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token for hub dashboard:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }

  // Get hub dashboard statistics
  async getHubStats(): Promise<HubStats> {
    try {
      const url = `${this.baseUrl}/api/hub/stats`;
      const token = this.getAuthToken();

      console.log('Fetching hub stats from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: HubStatsResponse = await authService.handleApiResponse(response);

      console.log('Fetched hub stats:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch hub statistics');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching hub stats:', error);
      throw error;
    }
  }

  // Get batch performance statistics
  async getBatchPerformance(): Promise<BatchPerformance> {
    try {
      const url = `${this.baseUrl}/api/hub/batch-performance`;
      const token = this.getAuthToken();

      console.log('Fetching batch performance from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: BatchPerformanceResponse = await authService.handleApiResponse(response);

      console.log('Fetched batch performance:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch batch performance');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching batch performance:', error);
      throw error;
    }
  }
}

export const hubDashboardService = new HubDashboardService();