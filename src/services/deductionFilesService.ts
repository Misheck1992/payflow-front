// Deduction Files Service - handles super admin deduction file operations

export interface DeductionFile {
  id: number;
  institution_id: string;
  institution_name?: string;
  file: string;
  total_invoice: string;
  approved_by: string;
  created_on: string;
  approved_on: string | null;
  comment: string;
  // Computed/derived fields
  status?: 'UPLOADED' | 'APPROVED' | 'REJECTED';
  file_size?: string;
  original_filename?: string;
  records_count?: number;
  processed_amount?: string;
  pending_approval?: boolean;
}

export interface DeductionFilesListResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    files: DeductionFile[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    summary?: {
      total_files: number;
      uploaded_files: number;
      approved_files: number;
      rejected_files: number;
      total_amount_uploaded: string;
      total_amount_approved: string;
      total_amount_pending: string;
    };
  };
}

export interface ApproveRejectResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    file: DeductionFile;
  };
}

class DeductionFilesService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('DeductionFilesService initialized with baseUrl:', this.baseUrl);
  }

  private getAuthToken(): string {
    return localStorage.getItem('payflow_token') || '';
  }

  /**
   * Get all deduction files from all institutions (Super Admin view)
   */
  async getAllDeductionFiles(
    status?: string,
    page = 1,
    limit = 20,
    institutionId?: string
  ): Promise<DeductionFilesListResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      queryParams.append('page', page.toString());
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }
      
      if (institutionId) {
        queryParams.append('institution_id', institutionId);
      }

      const url = `${this.baseUrl}/api/super-admin/deduction-files?${queryParams.toString()}`;
      console.log('Fetching all deduction files from:', url);

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
        throw new Error(`Failed to fetch deduction files: ${response.status} ${errorText}`);
      }

      const data: DeductionFilesListResponse = await response.json();
      console.log('Deduction files response:', data);

      // Process files to add computed fields
      if (data.data.files) {
        data.data.files = data.data.files.map(file => {
          // Extract filename from file path
          const filename = file.file.split('/').pop() || file.file;
          
          // Determine status based on approval fields
          let status: 'UPLOADED' | 'APPROVED' | 'REJECTED' = 'UPLOADED';
          if (file.approved_on && file.approved_by) {
            status = 'APPROVED';
          } else if (file.approved_by && !file.approved_on) {
            status = 'REJECTED';
          }

          // Extract record count from comment if available
          const recordMatch = file.comment.match(/(\d+)\s+records/);
          const records_count = recordMatch ? parseInt(recordMatch[1]) : 0;

          return {
            ...file,
            original_filename: filename,
            status,
            records_count,
            pending_approval: !file.approved_on && !file.approved_by,
            file_size: '0', // Not provided by API
            processed_amount: file.approved_on ? file.total_invoice : '0.00'
          };
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching deduction files:', error);
      throw error;
    }
  }

  /**
   * Approve a deduction file
   */
  async approveDeductionFile(fileId: number, comment?: string): Promise<ApproveRejectResponse> {
    try {
      const url = `${this.baseUrl}/api/super-admin/deduction-files/${fileId}/approve`;
      console.log('Approving deduction file at:', url, 'with comment:', comment);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment || '' }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to approve deduction file: ${response.status} ${errorText}`);
      }

      const data: ApproveRejectResponse = await response.json();
      console.log('Approve response:', data);
      return data;
    } catch (error) {
      console.error('Error approving deduction file:', error);
      throw error;
    }
  }

  /**
   * Reject a deduction file
   */
  async rejectDeductionFile(fileId: number, comment?: string): Promise<ApproveRejectResponse> {
    try {
      const url = `${this.baseUrl}/api/super-admin/deduction-files/${fileId}/reject`;
      console.log('Rejecting deduction file at:', url, 'with comment:', comment);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment || '' }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to reject deduction file: ${response.status} ${errorText}`);
      }

      const data: ApproveRejectResponse = await response.json();
      console.log('Reject response:', data);
      return data;
    } catch (error) {
      console.error('Error rejecting deduction file:', error);
      throw error;
    }
  }

  /**
   * Get file details/preview
   */
  async getFileDetails(fileId: number): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/super-admin/deduction-files/${fileId}`;
      console.log('Fetching file details from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch file details: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('File details response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching file details:', error);
      throw error;
    }
  }
}

export const deductionFilesService = new DeductionFilesService();
