// Dashboard Service - handles dashboard API calls

export interface DashboardStats {
  totalUsers: number;
  totalDeductionRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  processingRequests: number;
  totalApprovedAmount: string;
  totalProcessedAmount: string;
  nextScheduledCollections: string;
  totalPaymentsCollected: string;
  collectionRate: number;
  activeLoans: number;
  pendingApplications: number;
  totalEmployees: number;
  totalEmployers: number;
}

export interface DashboardApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    stats: DashboardStats;
    recent_activity?: Array<{
      id: string;
      action: string;
      time: string;
      type: 'info' | 'success' | 'warning' | 'error';
    }>;
  };
}

class DashboardService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('DashboardService initialized with baseUrl:', this.baseUrl);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const url = `${this.baseUrl}/api/dashboard/stats`;
      console.log('Fetching dashboard stats from:', url);

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
        throw new Error(`Failed to fetch dashboard stats: ${response.status} ${errorText}`);
      }

      const apiResponse: DashboardApiResponse = await response.json();
      console.log('Dashboard stats response:', apiResponse);

      return apiResponse.data.stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data if API fails
      return this.getFallbackStats();
    }
  }

  async getRecentActivity(): Promise<Array<{
    id: string;
    action: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>> {
    try {
      const url = `${this.baseUrl}/api/dashboard/recent-activity`;
      console.log('Fetching recent activity from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch recent activity: ${response.status} ${errorText}`);
      }

      const apiResponse = await response.json();
      console.log('Recent activity response:', apiResponse);

      return apiResponse.data.recent_activity || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return this.getFallbackActivity();
    }
  }

  private getFallbackStats(): DashboardStats {
    return {
      totalUsers: 1247,
      totalDeductionRequests: 89,
      pendingRequests: 23,
      approvedRequests: 56,
      rejectedRequests: 10,
      processingRequests: 0,
      totalApprovedAmount: "12500000",
      totalProcessedAmount: "8750000",
      nextScheduledCollections: "2500000",
      totalPaymentsCollected: "15750000",
      collectionRate: 85.3,
      activeLoans: 234,
      pendingApplications: 12,
      totalEmployees: 2456,
      totalEmployers: 45
    };
  }

  private getFallbackActivity(): Array<{
    id: string;
    action: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }> {
    return [
      {
        id: '1',
        action: 'New deduction request submitted by John Doe',
        time: '2 minutes ago',
        type: 'info'
      },
      {
        id: '2',
        action: 'Payment collection completed for January',
        time: '1 hour ago',
        type: 'success'
      },
      {
        id: '3',
        action: 'Loan application requires review',
        time: '3 hours ago',
        type: 'warning'
      },
      {
        id: '4',
        action: 'Monthly collection target achieved',
        time: '1 day ago',
        type: 'success'
      }
    ];
  }

  private getAuthToken(): string {
    const token = localStorage.getItem('payflow_token') || '';
    console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();