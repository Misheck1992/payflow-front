// Mock data for PayFlow Malawi - will be replaced with API calls later

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  institutionId: string;
  institution: Institution;
  avatar?: string;
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
}

export interface Institution {
  id: string;
  institutionCode: string;
  name: string;
  type: 'EMPLOYER' | 'SACCO' | 'FINANCIAL_INSTITUTION' | 'HYBRID' | 'HUB';
  logo?: string;
  registrationNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'EMPLOYER_ADMIN'
  | 'SACCO_ADMIN';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
  children?: MenuItem[];
}

// Mock Institutions
export const mockInstitutions: Institution[] = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    institutionCode: 'PFHUB001',
    name: 'PayFlow Hub',
    type: 'HUB',
    registrationNumber: 'HUB001',
    address: 'Technology Park, Lilongwe',
    contactEmail: 'admin@payflow.mw',
    contactPhone: '+265 1 800 000',
    isActive: true
  },
  {
    id: '1',
    institutionCode: 'MOH001',
    name: 'Ministry of Health',
    type: 'EMPLOYER',
    registrationNumber: 'GOV001',
    address: 'Capital Hill, Lilongwe',
    contactEmail: 'hr@health.gov.mw',
    contactPhone: '+265 1 789 400',
    isActive: true
  },
  {
    id: '2',
    institutionCode: 'MSB001',
    name: 'Malawi Savings Bank',
    type: 'FINANCIAL_INSTITUTION',
    registrationNumber: 'BANK001',
    address: 'Victoria Avenue, Blantyre',
    contactEmail: 'operations@msb.mw',
    contactPhone: '+265 1 620 722',
    isActive: true
  },
  {
    id: '3',
    institutionCode: 'MASM001',
    name: 'MASM SACCO',
    type: 'SACCO',
    registrationNumber: 'SACCO001',
    address: 'Kamuzu Procession Road, Lilongwe',
    contactEmail: 'info@masm.mw',
    contactPhone: '+265 1 754 832',
    isActive: true
  }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@payflow.mw',
    fullName: 'System Administrator',
    role: 'SUPER_ADMIN',
    institutionId: '00000000-0000-0000-0000-000000000000',
    institution: mockInstitutions[0], // PayFlow Hub
    permissions: ['*'],
    isActive: true,
    lastLogin: new Date('2024-01-15T10:30:00')
  },
  {
    id: '6',
    username: 'alladmin',
    email: 'alladmin@payflow.mw',
    fullName: 'Complete Administrator',
    role: 'EMPLOYER_ADMIN',
    institutionId: '1',
    institution: mockInstitutions[1], // Ministry of Health (EMPLOYER)
    permissions: ['*', 'admin:all', 'hr:all', 'payroll:all', 'deductions:all', 'reports:all', 'analytics:all'],
    isActive: true,
    lastLogin: new Date('2024-01-15T11:15:00')
  }
];

// Menu Configuration based on roles
export const menuConfig: Record<UserRole, MenuItem[]> = {
  // Super Admin menus - for special institution ID "00000000-0000-0000-0000-000000000000"
  SUPER_ADMIN: [
    {
      id: 'platform-dashboard',
      label: 'Platform Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'institution-management',
      label: 'Institution Management',
      path: '/institutions',
      icon: 'Building',
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'employer-invoices',
      label: 'Employer Invoices',
      path: '/employer-invoices',
      icon: 'FileSpreadsheet',
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'all-due-deductions',
      label: 'All Due Deductions',
      path: '/deductions/all-due',
      icon: 'Clock',
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'deduction-processing',
      label: 'Deduction Processing',
      path: '/deduction-processing',
      icon: 'Settings',
      roles: ['SUPER_ADMIN']
    },
    {
      id: 'system-configuration',
      label: 'System Configuration',
      path: '/configuration',
      icon: 'Settings',
      roles: ['SUPER_ADMIN']
    }
  ],
  
  // Employer Institution menus - for all other institutions (alladmin menu)
  EMPLOYER_ADMIN: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['EMPLOYER_ADMIN']
    },
    {
      id: 'deduction-management',
      label: 'Deduction Management',
      path: '/deductions',
      icon: 'Minus',
      roles: ['EMPLOYER_ADMIN'],
      children: [
        {
          id: 'affordability-check',
          label: 'Affordability Check',
          path: '/deductions/affordability',
          icon: 'Search',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'upload-deductions',
          label: 'Upload Deductions',
          path: '/deductions/upload',
          icon: 'Upload',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'scheduled-invoices',
          label: 'Scheduled Invoices',
          path: '/deductions/scheduled',
          icon: 'Calendar',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'deduction-approval',
          label: 'Deductions to Us',
          path: '/deductions/approvals',
          icon: 'CheckCircle',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'due-deductions',
          label: 'Due Deductions',
          path: '/deductions/due',
          icon: 'Clock',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'deduction-processing',
          label: 'Processing Records',
          path: '/deductions/processing',
          icon: 'Settings',
          roles: ['EMPLOYER_ADMIN']
        }
      ]
    },
    {
      id: 'institution-settings',
      label: 'Institution Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['EMPLOYER_ADMIN']
    },
    {
      id: 'user-management',
      label: 'User Management',
      path: '/users',
      icon: 'Users',
      roles: ['EMPLOYER_ADMIN'],
      children: [
        {
          id: 'users-list',
          label: 'Users',
          path: '/users',
          icon: 'Users',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'user-roles',
          label: 'User Roles',
          path: '/users/roles',
          icon: 'Shield',
          roles: ['EMPLOYER_ADMIN']
        }
      ]
    },
    {
      id: 'hr-management',
      label: 'HR Management',
      path: '/hr',
      icon: 'UserCheck',
      roles: ['EMPLOYER_ADMIN'],
      children: [
        {
          id: 'departments',
          label: 'Departments',
          path: '/departments',
          icon: 'Building2',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'employee-management',
          label: 'Employee Management',
          path: '/hr/employees',
          icon: 'Users',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'employee-positions',
          label: 'Employee Positions',
          path: '/hr/positions',
          icon: 'Briefcase',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'leave-management',
          label: 'Leave Management',
          path: '/hr/leave',
          icon: 'Calendar',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'attendance-tracking',
          label: 'Attendance Tracking',
          path: '/hr/attendance',
          icon: 'Clock',
          roles: ['EMPLOYER_ADMIN']
        },
        {
          id: 'performance-reviews',
          label: 'Performance Reviews',
          path: '/hr/performance',
          icon: 'Award',
          roles: ['EMPLOYER_ADMIN']
        }
      ]
    },
    {
      id: 'institution-membership',
      label: 'Institution Membership',
      path: '/membership',
      icon: 'Building2',
      roles: ['EMPLOYER_ADMIN'],
      children: [
        {
          id: 'institution-members',
          label: 'Members',
          path: '/membership/members',
          icon: 'Users',
          roles: ['EMPLOYER_ADMIN']
        }
      ]
    }
  ],

  // SACCO Institution menus - for SACCO institutions
  SACCO_ADMIN: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['SACCO_ADMIN']
    },
    {
      id: 'deduction-management',
      label: 'Deduction Management',
      path: '/deductions',
      icon: 'Minus',
      roles: ['SACCO_ADMIN'],
      children: [
        {
          id: 'affordability-check',
          label: 'Affordability Check',
          path: '/deductions/affordability',
          icon: 'Search',
          roles: ['SACCO_ADMIN']
        },
        {
          id: 'request-deduction',
          label: 'Request Deduction',
          path: '/deductions/requests',
          icon: 'FileText',
          roles: ['SACCO_ADMIN']
        },
        {
          id: 'deduction-processing',
          label: 'Employee Commitments',
          path: '/deductions/processing',
          icon: 'Settings',
          roles: ['SACCO_ADMIN']
        },
        {
          id: 'employer-payment-files',
          label: 'Employer Commitments',
          path: '/deductions/employer-payments',
          icon: 'FileText',
          roles: ['SACCO_ADMIN']
        }
      ]
    },
    {
      id: 'institution-settings',
      label: 'Institution Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['SACCO_ADMIN']
    },
    {
      id: 'user-management',
      label: 'User Management',
      path: '/users',
      icon: 'UserCog',
      roles: ['SACCO_ADMIN'],
      children: [
        {
          id: 'users-list',
          label: 'Users',
          path: '/users',
          icon: 'Users',
          roles: ['SACCO_ADMIN']
        },
        {
          id: 'user-roles',
          label: 'User Roles',
          path: '/users/roles',
          icon: 'Shield',
          roles: ['SACCO_ADMIN']
        }
      ]
    }
  ]
};

// Mock login function
export const mockLogin = async (username: string, password: string, institutionId?: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.username === username);
  
  if (!user || password !== 'password123') {
    throw new Error('Invalid credentials');
  }
  
  if (institutionId && user.institutionId !== institutionId) {
    throw new Error('User not authorized for this institution');
  }

  // Mock JWT token
  const token = `mock.jwt.token.${user.id}`;
  
  return {
    user,
    token,
    refreshToken: `refresh.token.${user.id}`
  };
};

// Mock dashboard data
export const mockDashboardData = {
  SUPER_ADMIN: {
    totalInstitutions: 45,
    activeUsers: 234,
    monthlyTransactions: 15678,
    systemUptime: '99.9%',
    recentActivity: [
      { id: '1', action: 'New institution registered', time: '2 hours ago', type: 'info' },
      { id: '2', action: 'System maintenance completed', time: '1 day ago', type: 'success' },
      { id: '3', action: 'Security scan completed', time: '2 days ago', type: 'success' }
    ]
  },
  EMPLOYER_ADMIN: {
    totalEmployees: 1250,
    pendingLeaveRequests: 8,
    newHires: 12,
    payrollStatus: 'In Progress',
    upcomingEvents: [
      { id: '1', title: 'Monthly Payroll Run', date: '2024-01-25', type: 'payroll' },
      { id: '2', title: 'Performance Review Period', date: '2024-02-01', type: 'hr' }
    ]
  },
  SACCO_ADMIN: {
    totalUsers: 2840,
    nextScheduledCollections: 8750000,
    totalPaymentsCollected: 9850000,
    totalDeductionRequests: 156,
    collectionRate: 79.1,
    activeLoans: 1456,
    pendingApplications: 23,
    recentActivity: [
      { id: '1', action: 'Large payment received', amount: 'MWK 450,000', time: '30 minutes ago', type: 'success' },
      { id: '2', action: 'New loan application', member: 'John Banda', time: '2 hours ago', type: 'info' },
      { id: '3', action: 'Monthly collection completed', amount: 'MWK 2.1M', time: '1 day ago', type: 'success' },
      { id: '4', action: 'New deduction request submitted', count: '12 requests', time: '2 days ago', type: 'info' }
    ]
  }
};
