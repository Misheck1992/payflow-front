// System Configuration Service - handles super admin system configuration operations

export interface SystemSetting {
  id: string;
  institution_id?: string;
  institution_name?: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'decimal' | 'boolean' | 'json';
  description: string;
  is_encrypted: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface SystemSettingsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    global_settings: SystemSetting[];
    institution_settings: SystemSetting[];
    summary: {
      total_settings: number;
      global_settings: number;
      institution_settings: number;
    };
  };
}

export interface CreateUpdateSettingRequest {
  institution_id?: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'decimal' | 'boolean' | 'json';
  description?: string;
}

export interface CreateUpdateSettingResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    setting: SystemSetting;
  };
}

export interface PaymentCutoffRequest {
  cutoff_day: number;
}

export interface PaymentCutoffResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    cutoff_day: number;
    updated_at: string;
    updated_by: string;
  };
}

export interface DeleteSettingResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    deleted_setting_id: string;
  };
}

class SystemConfigurationService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('SystemConfigurationService initialized with baseUrl:', this.baseUrl);
  }

  private getAuthToken(): string {
    return localStorage.getItem('payflow_token') || '';
  }

  /**
   * Get all system settings (global and institution-specific)
   */
  async getAllSystemSettings(): Promise<SystemSettingsResponse> {
    try {
      const url = `${this.baseUrl}/api/super-admin/system/settings`;
      console.log('Fetching all system settings from:', url);

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
        throw new Error(`Failed to fetch system settings: ${response.status} ${errorText}`);
      }

      const data: SystemSettingsResponse = await response.json();
      console.log('System settings response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  }

  /**
   * Get a specific system setting by key
   */
  async getSystemSetting(settingKey: string, institutionId?: string): Promise<SystemSetting> {
    try {
      let url = `${this.baseUrl}/api/super-admin/system/settings/${settingKey}`;
      if (institutionId) {
        url += `?institution_id=${institutionId}`;
      }
      console.log('Fetching system setting from:', url);

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
        throw new Error(`Failed to fetch system setting: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('System setting response:', data);
      return data.data.setting;
    } catch (error) {
      console.error('Error fetching system setting:', error);
      throw error;
    }
  }

  /**
   * Create or update a system setting
   */
  async createOrUpdateSetting(settingData: CreateUpdateSettingRequest): Promise<CreateUpdateSettingResponse> {
    try {
      const url = `${this.baseUrl}/api/super-admin/system/settings`;
      console.log('Creating/updating system setting at:', url, 'with data:', settingData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to create/update system setting: ${response.status} ${errorText}`);
      }

      const data: CreateUpdateSettingResponse = await response.json();
      console.log('System setting create/update response:', data);
      return data;
    } catch (error) {
      console.error('Error creating/updating system setting:', error);
      throw error;
    }
  }

  /**
   * Delete a system setting
   */
  async deleteSetting(settingId: string): Promise<DeleteSettingResponse> {
    try {
      const url = `${this.baseUrl}/api/super-admin/system/settings/${settingId}`;
      console.log('Deleting system setting at:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to delete system setting: ${response.status} ${errorText}`);
      }

      const data: DeleteSettingResponse = await response.json();
      console.log('System setting delete response:', data);
      return data;
    } catch (error) {
      console.error('Error deleting system setting:', error);
      throw error;
    }
  }

  /**
   * Update payment cutoff day (legacy endpoint - still supported)
   */
  async updatePaymentCutoff(cutoffDay: number): Promise<PaymentCutoffResponse> {
    try {
      const url = `${this.baseUrl}/api/super-admin/system/init-payment-cutoff`;
      console.log('Updating payment cutoff at:', url, 'with cutoff_day:', cutoffDay);

      const payload: PaymentCutoffRequest = {
        cutoff_day: cutoffDay
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update payment cutoff: ${response.status} ${errorText}`);
      }

      const data: PaymentCutoffResponse = await response.json();
      console.log('Payment cutoff update response:', data);
      return data;
    } catch (error) {
      console.error('Error updating payment cutoff:', error);
      throw error;
    }
  }

  /**
   * Helper method to update payment cutoff using the new settings endpoint
   */
  async updatePaymentCutoffViaSetting(cutoffDay: number): Promise<CreateUpdateSettingResponse> {
    return this.createOrUpdateSetting({
      setting_key: 'payment_cutoff_day',
      setting_value: cutoffDay.toString(),
      setting_type: 'number',
      description: 'Day of the month for payment processing cut-off (1-28)'
    });
  }

  /**
   * Helper method to update maintenance mode
   */
  async updateMaintenanceMode(enabled: boolean): Promise<CreateUpdateSettingResponse> {
    return this.createOrUpdateSetting({
      setting_key: 'maintenance_mode',
      setting_value: enabled.toString(),
      setting_type: 'boolean',
      description: 'System maintenance mode status'
    });
  }

  /**
   * Helper method to update maximum deduction amount
   */
  async updateMaxDeductionAmount(amount: number): Promise<CreateUpdateSettingResponse> {
    return this.createOrUpdateSetting({
      setting_key: 'max_deduction_amount',
      setting_value: amount.toString(),
      setting_type: 'number',
      description: 'Maximum allowed deduction amount'
    });
  }

  /**
   * Helper method to update session timeout
   */
  async updateSessionTimeout(minutes: number): Promise<CreateUpdateSettingResponse> {
    return this.createOrUpdateSetting({
      setting_key: 'session_timeout_minutes',
      setting_value: minutes.toString(),
      setting_type: 'number',
      description: 'User session timeout in minutes'
    });
  }

  /**
   * Helper method to update maximum file size
   */
  async updateMaxFileSize(sizeMB: number): Promise<CreateUpdateSettingResponse> {
    return this.createOrUpdateSetting({
      setting_key: 'max_file_size_mb',
      setting_value: sizeMB.toString(),
      setting_type: 'number',
      description: 'Maximum file upload size in megabytes'
    });
  }

  /**
   * Test system connectivity
   */
  async testSystemConnectivity(): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/super-admin/system/health`;
      console.log('Testing system connectivity at:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`System health check failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('System health response:', data);
      return data;
    } catch (error) {
      console.error('Error testing system connectivity:', error);
      throw error;
    }
  }
}

export const systemConfigurationService = new SystemConfigurationService();
