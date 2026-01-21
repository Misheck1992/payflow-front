// Employer Payment Files Service - handles SACCO payment files API calls
import { authService } from '@/services/authService';

export interface EmployerPaymentFile {
  employer_payment_id: number;
  file_name: string;
  sacco_institution_id: string;
  employer_institution_id: string;
  batch_no: string;
  total_amount: number;
  processed_on: string;
  sacco_name: string;
  sacco_code: string;
  employer_name: string;
  employer_code: string;
}

export interface EmployerPaymentFilesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    files: EmployerPaymentFile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    filters: {
      batch_no: string | null;
      employer_institution_id: string | null;
      start_date: string | null;
      end_date: string | null;
    };
  };
}

export interface EmployerPaymentFilesFilters {
  batch_no?: string;
  employer_institution_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

class EmployerPaymentFilesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token for employer payment files:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }

  // Get all employer payment files for the SACCO
  async getEmployerPaymentFiles(filters: EmployerPaymentFilesFilters = {}): Promise<EmployerPaymentFilesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.batch_no) queryParams.append('batch_no', filters.batch_no);
      if (filters.employer_institution_id) queryParams.append('employer_institution_id', filters.employer_institution_id);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${this.baseUrl}/api/deduction-processing/employer-payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const token = this.getAuthToken();

      console.log('Fetching employer payment files from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, { headers });
      const apiResponse: EmployerPaymentFilesResponse = await authService.handleApiResponse(response);

      console.log('Fetched employer payment files:', apiResponse);

      // Check if the API response indicates success
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch employer payment files');
      }

      return apiResponse;
    } catch (error) {
      console.error('Error fetching employer payment files:', error);
      throw error;
    }
  }

  // Download a specific payment file
  async downloadPaymentFile(filename: string): Promise<Blob> {
    try {
      const url = `${this.baseUrl}/api/deduction-processing/employer-payments/download/${encodeURIComponent(filename)}`;
      const token = this.getAuthToken();

      console.log('Downloading payment file from:', url);

      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message === 'Token expired' || response.status === 401) {
          authService.handleTokenExpiration();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(errorData.message || `Failed to download file: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('File downloaded successfully');
      return blob;
    } catch (error) {
      console.error('Error downloading payment file:', error);
      throw error;
    }
  }

  // Helper method to trigger file download in browser
  downloadFileToDevice(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const employerPaymentFilesService = new EmployerPaymentFilesService();