// Institution Members Service - handles SACCO/Financial Institution member management

export interface InstitutionMember {
  id: string;
  institutionId: string;
  institutionName: string;
  memberNumber: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  employerInstitutionId: string;
  employerInstitutionName: string;
  membershipDate: string;
  membershipStatus: string;
  shareBalance: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateMemberRequest {
  employeeId: string;
  employerInstitutionId: string;
  memberNumber: string;
  membershipDate: string;
  membershipStatus: string;
  shareBalance: number;
}

export interface UpdateMemberRequest {
  memberNumber?: string;
  membershipDate?: string;
  membershipStatus?: string;
  shareBalance?: number;
}

class InstitutionMembersService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134';

  constructor() {
    console.log('InstitutionMembersService initialized with baseUrl:', this.baseUrl);
  }

  async getInstitutionMembers(institutionId: string): Promise<InstitutionMember[]> {
    try {
      const url = `${this.baseUrl}/api/InstitutionMembers/institution/${institutionId}`;
      console.log('Fetching institution members from:', url);
      
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
        throw new Error(`Failed to fetch institution members: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched institution members data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching institution members:', error);
      throw error;
    }
  }

  async createMember(institutionId: string, memberData: CreateMemberRequest): Promise<InstitutionMember> {
    try {
      const url = `${this.baseUrl}/api/InstitutionMembers/institution/${institutionId}`;
      console.log('Creating member at:', url, 'with data:', memberData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to create member: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Created member data:', data);
      return data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  async updateMember(memberId: string, updateData: UpdateMemberRequest): Promise<InstitutionMember> {
    try {
      const url = `${this.baseUrl}/api/InstitutionMembers/${memberId}`;
      console.log('Updating member at:', url, 'with data:', updateData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update member: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Updated member data:', data);
      return data;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  async deleteMember(memberId: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/InstitutionMembers/${memberId}`;
      console.log('Deleting member at:', url);
      
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
        throw new Error(`Failed to delete member: ${response.status} ${errorText}`);
      }
      
      console.log('Member deleted successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

  async getMemberById(memberId: string): Promise<InstitutionMember> {
    try {
      const url = `${this.baseUrl}/api/InstitutionMembers/${memberId}`;
      console.log('Fetching member by ID from:', url);
      
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
        throw new Error(`Failed to fetch member: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched member data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching member:', error);
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
export const institutionMembersService = new InstitutionMembersService();
