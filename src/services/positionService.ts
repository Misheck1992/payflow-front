// Position service for PayFlow Malawi - handles position API calls

export interface Position {
  id: string;
  institution_id: string;
  position_code: string;
  position_title: string;
  department_id: string;
  job_description: string | null;
  requirements: string | null;
  salary_grade: string;
  min_salary: number;
  max_salary: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  department?: {
    id: string;
    department_name: string;
    department_code: string;
  };
  employee_count?: number;
}

export interface CreatePositionRequest {
  position_code: string;
  position_title: string;
  department_id: string;
  salary_grade: string;
  min_salary: number;
  max_salary: number;
}

export interface PositionsApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    positions: Position[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface CreatePositionApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Position;
}

class PositionService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  constructor() {
    console.log('PositionService initialized with baseUrl:', this.baseUrl);
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  }

  async getPositions(): Promise<Position[]> {
    try {
      const url = `${this.baseUrl}/api/positions`;
      console.log('Fetching positions from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Positions response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch positions: ${response.status} ${errorText}`);
      }

      const apiResponse: PositionsApiResponse = await response.json();
      console.log('Fetched positions data:', apiResponse);

      return apiResponse.data.positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }


  async createPosition(positionData: CreatePositionRequest): Promise<Position> {
    try {
      const url = `${this.baseUrl}/api/positions`;
      console.log('Creating position at:', url, 'with data:', positionData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });

      console.log('Create position response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to create position: ${response.status} ${errorText}`);
      }

      const apiResponse: CreatePositionApiResponse = await response.json();
      console.log('Created position data:', apiResponse);

      return apiResponse.data;
    } catch (error) {
      console.error('Error creating position:', error);
      throw error;
    }
  }

  async updatePosition(positionId: string, positionData: Partial<CreatePositionRequest>): Promise<Position> {
    try {
      const url = `${this.baseUrl}/api/positions/${positionId}`;
      console.log('Updating position at:', url, 'with data:', positionData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });

      console.log('Update position response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update position: ${response.status} ${errorText}`);
      }

      const apiResponse: CreatePositionApiResponse = await response.json();
      console.log('Updated position data:', apiResponse);

      return apiResponse.data;
    } catch (error) {
      console.error('Error updating position:', error);
      throw error;
    }
  }

  async deletePosition(positionId: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/positions/${positionId}`;
      console.log('Deleting position at:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to delete position: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting position:', error);
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
export const positionService = new PositionService();
