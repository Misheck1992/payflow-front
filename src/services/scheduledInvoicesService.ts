export interface ScheduledInvoiceFile {
  id: number;
  institution_id: string;
  institution_name: string;
  institution_code: string;
  institution_type: string;
  contact_email: string;
  contact_phone: string;
  filename: string;
  payment_period: string;
  status: 'Active' | 'Elapsed' | 'Approved';
  generated_on: string;
  download_url: string;
  file_size_mb: string;
  days_since_generated: number;
}

export interface ScheduledInvoicesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    files: ScheduledInvoiceFile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    summary: {
      total_files: number;
      active_files: number;
      elapsed_files: number;
      total_institutions: number;
      files_generated_today: number;
      institutions_processed_today: number;
    };
    filters: {
      available_periods: string[];
      available_statuses: string[];
      current_filters: {
        status?: string;
        period?: string;
      };
    };
  };
}

export interface ScheduledInvoicesFilters {
  status?: string;
  period?: string;
  page?: number;
  limit?: number;
}

class ScheduledInvoicesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token for scheduled invoices:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }

  async getScheduledInvoices(filters: ScheduledInvoicesFilters = {}): Promise<ScheduledInvoicesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.period) queryParams.append('period', filters.period);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const url = `${this.baseUrl}/api/deduction-processing/scheduled/files${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const token = this.getAuthToken();

      console.log('Fetching scheduled invoices from:', url);
      console.log('Using token:', token ? 'Token present' : 'NO TOKEN');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('Request headers:', headers);

      const response = await fetch(url, { headers });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);

          // Handle authentication errors specifically
          if (response.status === 401 || errorData.message === 'Access token required') {
            throw new Error('Authentication failed. Please log in again.');
          }

          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.join('\n');
            throw new Error(errorMessages);
          }

          if (errorData.message) {
            throw new Error(errorData.message);
          }

          throw new Error(`Failed to fetch scheduled invoices: ${response.status} ${response.statusText}`);
        } catch (parseError) {
          const errorText = await response.text();

          // Handle authentication errors in text response
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }

          throw new Error(`Failed to fetch scheduled invoices: ${response.status} ${errorText}`);
        }
      }

      const apiResponse: ScheduledInvoicesResponse = await response.json();
      console.log('Fetched scheduled invoices:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('Error fetching scheduled invoices:', error);
      throw error;
    }
  }

  async downloadFile(filename: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/deduction-processing/scheduled/download/${filename}`;
      console.log('Downloading file from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      // Create download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async approveScheduledInvoice(id: number): Promise<{ success: boolean; message: string; data: ScheduledInvoiceFile }> {
    try {
      const url = `${this.baseUrl}/api/deduction-processing/scheduled/${id}/approve`;
      console.log('Approving scheduled invoice:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(errorData?.message || `Failed to approve invoice: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Invoice approved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error approving invoice:', error);
      throw error;
    }
  }

  async bulkApproveScheduledInvoices(ids: number[]): Promise<{
    success: boolean;
    message: string;
    data: {
      approved_count: number;
      approved_ids: number[];
      errors: Array<{ id: number; error: string }>;
      summary: {
        total: number;
        approved: number;
        failed: number;
      };
    };
  }> {
    try {
      const url = `${this.baseUrl}/api/deduction-processing/scheduled/bulk-approve`;
      console.log('Bulk approving scheduled invoices:', url, { ids });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(errorData?.message || `Failed to bulk approve invoices: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Bulk approval completed:', result);
      return result;
    } catch (error) {
      console.error('Error bulk approving invoices:', error);
      throw error;
    }
  }
}

export const scheduledInvoicesService = new ScheduledInvoicesService();