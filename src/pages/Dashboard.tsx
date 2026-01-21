import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { mockDashboardData } from '@/lib/mockData';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import { deductionRequestService } from '@/services/deductionRequestService';
import { hubDashboardService, HubStats, BatchPerformance } from '@/services/hubDashboardService';
import { saccoDashboardService, SaccoStats, SaccoBatchPerformance } from '@/services/saccoDashboardService';
import { employerDashboardService, EmployerStats, EmployerBatchPerformance } from '@/services/employerDashboardService';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Building,
  Activity,
  TrendingUp,
  CreditCard,
  UserCheck,
  Calendar,
  FileText,
  DollarSign,
  Target,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent,
  Banknote,
  Loader2,
  Clock,
  CheckCircle,
  Package
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [hubStats, setHubStats] = useState<HubStats | null>(null);
  const [batchPerformance, setBatchPerformance] = useState<BatchPerformance | null>(null);
  const [saccoStats, setSaccoStats] = useState<SaccoStats | null>(null);
  const [saccoBatchPerformance, setSaccoBatchPerformance] = useState<SaccoBatchPerformance | null>(null);
  const [employerStats, setEmployerStats] = useState<EmployerStats | null>(null);
  const [employerBatchPerformance, setEmployerBatchPerformance] = useState<EmployerBatchPerformance | null>(null);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    action: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hubLoading, setHubLoading] = useState(true);

  if (!user) return null;

  // Load dashboard data on component mount
  useEffect(() => {
    if (user.institution?.type === 'HUB' || user.institutionId === '00000000-0000-0000-0000-000000000000') {
      loadHubDashboardData();
    } else if (user.role === 'SACCO_ADMIN' || user.institution?.type === 'SACCO' || user.institution?.type === 'FINANCIAL_INSTITUTION') {
      loadNewSaccoDashboardData();
    } else if (user.role === 'EMPLOYER_ADMIN' || user.institution?.type === 'EMPLOYER') {
      loadNewEmployerDashboardData();
    } else {
      setIsLoading(false);
      setHubLoading(false);
    }
  }, [user]);

  const loadHubDashboardData = async () => {
    try {
      setHubLoading(true);
      console.log('Loading Hub dashboard data...');

      const [hubStatsData, batchPerformanceData] = await Promise.all([
        hubDashboardService.getHubStats(),
        hubDashboardService.getBatchPerformance()
      ]);

      console.log('Hub stats:', hubStatsData);
      console.log('Batch performance:', batchPerformanceData);

      setHubStats(hubStatsData);
      setBatchPerformance(batchPerformanceData);
    } catch (error) {
      console.error('Error loading hub dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load hub dashboard data. Using fallback data."
      });
    } finally {
      setHubLoading(false);
    }
  };

  const loadNewSaccoDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading SACCO dashboard data from new API...');

      const [saccoStatsData, saccoBatchData] = await Promise.all([
        saccoDashboardService.getSaccoStats(),
        saccoDashboardService.getSaccoBatchPerformance(10)
      ]);

      console.log('SACCO stats:', saccoStatsData);
      console.log('SACCO batch performance:', saccoBatchData);

      setSaccoStats(saccoStatsData);
      setSaccoBatchPerformance(saccoBatchData);
    } catch (error) {
      console.error('Error loading SACCO dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load SACCO dashboard data. Using fallback data."
      });
      // Use fallback data - try the old API as backup
      loadSaccoDashboardData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadNewEmployerDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading Employer dashboard data from new API...');

      const [employerStatsData, employerBatchData] = await Promise.all([
        employerDashboardService.getEmployerStats(),
        employerDashboardService.getEmployerBatchPerformance(10)
      ]);

      console.log('Employer stats:', employerStatsData);
      console.log('Employer batch performance:', employerBatchData);

      setEmployerStats(employerStatsData);
      setEmployerBatchPerformance(employerBatchData);
    } catch (error) {
      console.error('Error loading Employer dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load Employer dashboard data. Using fallback data."
      });
      // Use fallback data from mock data
      setEmployerStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSaccoDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading SACCO dashboard data...');

      const [stats, activity, deductionRequestsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(),
        deductionRequestService.getDeductionRequests()
      ]);

      console.log('Dashboard stats:', stats);
      console.log('Recent activity:', activity);
      console.log('Deduction requests data:', deductionRequestsData);

      // Combine real deduction request data with dashboard stats
      const enhancedStats = {
        ...stats,
        totalDeductionRequests: deductionRequestsData.requests.length,
        pendingRequests: deductionRequestsData.requests.filter(r => r.request_status === 'PENDING').length,
        approvedRequests: deductionRequestsData.requests.filter(r => r.request_status === 'APPROVED').length,
        rejectedRequests: deductionRequestsData.requests.filter(r => r.request_status === 'REJECTED').length,
        processingRequests: deductionRequestsData.requests.filter(r => r.request_status === 'PROCESSING').length,
      };

      setDashboardStats(enhancedStats);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Using fallback data."
      });
      // Use fallback data from mock data
      setDashboardStats({
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
      });
      setRecentActivity([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const renderSuperAdminDashboard = () => {
    if (hubLoading) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Platform Overview</h1>
            <p className="text-muted-foreground mt-2">
              Monitor the entire PayFlow Malawi ecosystem
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading platform data...</span>
          </div>
        </div>
      );
    }

    const overview = hubStats?.overview;
    const institutions = hubStats?.institutions;
    const deductionFiles = hubStats?.deduction_files;
    const deductionRequests = hubStats?.deduction_requests;
    const users = hubStats?.users;
    const employees = hubStats?.employees;
    const recent = hubStats?.recent_activity;
    const financial = hubStats?.financial_summary;

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground mt-2">
            Monitor the entire PayFlow Malawi ecosystem
          </p>
        </div>

        {/* Main Overview Stats */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Institutions</p>
                <p className="text-lg font-semibold">{overview?.total_institutions || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Users</p>
                <p className="text-lg font-semibold">{overview?.total_users || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Employees</p>
                <p className="text-lg font-semibold">{overview?.total_employees || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Current Batch</p>
                <p className="text-sm font-semibold">{overview?.current_batch || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Banknote className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Total Value</p>
                <p className="text-sm font-semibold">{formatCurrency(financial?.total_deduction_value || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Institution Breakdown */}
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Employers</p>
                <p className="text-sm font-semibold">{institutions?.employers || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">SACCOs</p>
                <p className="text-sm font-semibold">{institutions?.saccos || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-600">Financial</p>
                <p className="text-sm font-semibold">{institutions?.financial_institutions || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-sm font-semibold">{institutions?.active || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">Inactive</p>
                <p className="text-sm font-semibold">{institutions?.inactive || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Suspended</p>
                <p className="text-sm font-semibold">{institutions?.suspended || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deduction Files & Requests */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Deduction Files
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600">Total Files</p>
                <p className="text-lg font-semibold">{deductionFiles?.total || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-semibold text-yellow-600">{deductionFiles?.pending_approval || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-semibold text-green-600">{deductionFiles?.approved || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Approval Rate</p>
                <p className="text-lg font-semibold">{deductionFiles?.approval_rate || '0%'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2 text-green-600" />
              Deduction Requests
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-lg font-semibold">{deductionRequests?.total || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-semibold text-yellow-600">{deductionRequests?.pending || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-semibold text-green-600">{deductionRequests?.approved || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Approval Rate</p>
                <p className="text-lg font-semibold">{deductionRequests?.approval_rate || '0%'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recent && (
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-purple-600" />
              Recent Activity (Last 30 Days)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-gray-600">Files Uploaded</p>
                <p className="text-lg font-semibold">{recent.files_uploaded_last_7_days || 0}</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Approvals</p>
                <p className="text-lg font-semibold">{recent.approvals_last_7_days || 0}</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">New Users</p>
                <p className="text-lg font-semibold">{recent.users_registered_last_30_days || 0}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">New Institutions</p>
                <p className="text-lg font-semibold">{recent.institutions_registered_last_30_days || 0}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEmployerDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage employees and HR operations for {user.institution?.name}
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading dashboard data...</span>
          </div>
        </div>
      );
    }

    // Use new Employer API data if available, otherwise fallback to mock data
    if (employerStats) {
      return renderNewEmployerDashboard();
    }

    const data = mockDashboardData.EMPLOYER_ADMIN;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage employees and HR operations for {user.institution?.name}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={data.totalEmployees}
            change={{ value: "+12 new hires", type: "increase" }}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Pending Leave Requests"
            value={data.pendingLeaveRequests}
            change={{ value: "3 urgent", type: "neutral" }}
            icon={Calendar}
            color="orange"
          />
          <StatCard
            title="New Hires This Month"
            value={data.newHires}
            change={{ value: "5 more than last month", type: "increase" }}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Payroll Status"
            value={data.payrollStatus}
            description="January 2024 payroll processing"
            icon={CreditCard}
            color="purple"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity
            activities={data.upcomingEvents.map(event => ({
              id: event.id,
              action: event.title,
              time: event.date,
              type: event.type === 'payroll' ? ('warning' as const) : ('info' as const)
            }))}
            title="Upcoming Events"
          />
        </div>
      </div>
    );
  };

  const renderSaccoDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">SACCO Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Financial operations and member management for {user.institution.name}
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading dashboard data...</span>
          </div>
        </div>
      );
    }

    // Use new SACCO API data if available, otherwise fallback to old data or mock data
    if (saccoStats) {
      return renderNewSaccoDashboard();
    }

    const data = dashboardStats || mockDashboardData.SACCO_ADMIN;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SACCO Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Financial operations and member management for {user.institution.name}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={data.totalUsers}
            change={{ value: "+45 new members", type: "increase" }}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Next Scheduled Collections"
            value={formatCurrency(data.nextScheduledCollections)}
            change={{ value: "Due next week", type: "neutral" }}
            icon={Target}
            color="indigo"
          />
          <StatCard
            title="Payments Collected"
            value={formatCurrency(data.totalPaymentsCollected)}
            change={{ value: `${data.collectionRate}% collection rate`, type: "increase" }}
            icon={ArrowDownCircle}
            color="green"
          />
          <StatCard
            title="Deduction Requests"
            value={data.totalDeductionRequests}
            change={{ value: `${data.pendingRequests} pending`, type: "neutral" }}
            icon={FileText}
            color="orange"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <StatCard
            title="Pending Requests"
            value={data.pendingRequests}
            change={{ value: "Require review", type: "warning" }}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Approved Requests"
            value={data.approvedRequests}
            change={{ value: formatCurrency(data.totalApprovedAmount), type: "success" }}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Collection Rate"
            value={data.collectionRate}
            change={{ value: "+2.3% improvement", type: "increase" }}
            icon={Percent}
            color="purple"
            suffix="%"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <StatCard
            title="Active Loans"
            value={data.activeLoans}
            change={{ value: "+23 new loans", type: "increase" }}
            icon={Banknote}
            color="red"
          />
          <StatCard
            title="Pending Applications"
            value={data.pendingApplications}
            change={{ value: "Review required", type: "neutral" }}
            icon={FileText}
            color="indigo"
          />
          <StatCard
            title="Total Employees"
            value={data.totalEmployees}
            change={{ value: `${data.totalEmployers} employers`, type: "neutral" }}
            icon={Users}
            color="blue"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity
            activities={recentActivity}
            title="Recent Financial Activity"
          />
          <div className="space-y-4">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors"
                  onClick={() => window.location.href = '/request-deduction'}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Create New Deduction Request</span>
                  </div>
                </button>
                <button
                  className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors"
                  onClick={() => window.location.href = '/deduction-approval'}
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Review Pending Approvals</span>
                  </div>
                </button>
                <button
                  className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors"
                  onClick={() => window.location.href = '/affordability-check'}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>Check Employee Affordability</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNewSaccoDashboard = () => {
    const overview = saccoStats?.overview;
    const employerPayments = saccoStats?.employer_payments;
    const deductionRequests = saccoStats?.deduction_requests;
    const employees = saccoStats?.employees;
    const batchProcessing = saccoStats?.batch_processing;
    const paymentFiles = saccoStats?.payment_files;
    const recentActivity = saccoStats?.recent_activity;
    const financial = saccoStats?.financial_summary;

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">SACCO Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Financial operations and member management for {user.institution?.name}
          </p>
        </div>

        {/* Main Overview Stats */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Current Batch</p>
                <p className="text-sm font-semibold">{overview?.current_batch || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Employer Payments</p>
                <p className="text-lg font-semibold">{overview?.total_employer_payments || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Deduction Requests</p>
                <p className="text-lg font-semibold">{overview?.total_deduction_requests || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Active Employees</p>
                <p className="text-lg font-semibold">{overview?.active_employees || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Banknote className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Total Received</p>
                <p className="text-sm font-semibold">{formatCurrency(overview?.total_amount_received || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employer Payments Breakdown */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Total Files</p>
                <p className="text-sm font-semibold">{employerPayments?.total_files || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Current Batch</p>
                <p className="text-sm font-semibold">{employerPayments?.current_batch_files || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Employers</p>
                <p className="text-sm font-semibold">{employerPayments?.unique_employers || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-600">Avg Payment</p>
                <p className="text-xs font-semibold">{formatCurrency(employerPayments?.average_payment_amount || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deduction Requests Breakdown */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-sm font-semibold">{deductionRequests?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-sm font-semibold">{deductionRequests?.pending || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-sm font-semibold">{deductionRequests?.approved || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-600">Approval Rate</p>
                <p className="text-sm font-semibold">{deductionRequests?.approval_rate || '0%'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Processing Status */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Batch Records</p>
                <p className="text-sm font-semibold">{batchProcessing?.current_batch_records || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Processed</p>
                <p className="text-sm font-semibold">{batchProcessing?.processed_records || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-sm font-semibold">{batchProcessing?.pending_processing || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-gray-600">Failed</p>
                <p className="text-sm font-semibold">{batchProcessing?.failed_processing || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Banknote className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Total Payments</p>
                <p className="text-xs font-semibold">{formatCurrency(financial?.total_payments_received || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Banknote className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Current Batch</p>
                <p className="text-xs font-semibold">{formatCurrency(financial?.current_batch_payments || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Approved Amount</p>
                <p className="text-xs font-semibold">{formatCurrency(financial?.total_approved_amount || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">Pending Amount</p>
                <p className="text-xs font-semibold">{formatCurrency(financial?.total_pending_amount || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">Payment Files</p>
                  <p className="text-sm font-semibold">{recentActivity.payment_files_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-600">Deduction Requests</p>
                  <p className="text-sm font-semibold">{recentActivity.deduction_requests_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-600">Approvals</p>
                  <p className="text-sm font-semibold">{recentActivity.approvals_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-600">Processing Records</p>
                  <p className="text-sm font-semibold">{recentActivity.processing_records_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNewEmployerDashboard = () => {
    const overview = employerStats?.overview;
    const employees = employerStats?.employees;
    const deductionFiles = employerStats?.deduction_files;
    const deductionRequests = employerStats?.deduction_requests;
    const batchProcessing = employerStats?.batch_processing;
    const departments = employerStats?.departments;
    const positions = employerStats?.positions;
    const payments = employerStats?.payments;
    const recentActivity = employerStats?.recent_activity;
    const financial = employerStats?.financial_summary;

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage employees and HR operations for {user.institution?.name}
          </p>
        </div>

        {/* Main Overview Stats */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Current Batch</p>
                <p className="text-sm font-semibold">{overview?.current_batch || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Total Employees</p>
                <p className="text-lg font-semibold">{overview?.total_employees || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Active Employees</p>
                <p className="text-lg font-semibold">{overview?.active_employees || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Departments</p>
                <p className="text-lg font-semibold">{overview?.total_departments || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Banknote className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Total Payroll</p>
                <p className="text-sm font-semibold">{formatCurrency(employees?.total_payroll || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Breakdown */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Total Employees</p>
                <p className="text-sm font-semibold">{employees?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-sm font-semibold">{employees?.active || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-600">Inactive</p>
                <p className="text-sm font-semibold">{employees?.inactive || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-600">Avg Salary</p>
                <p className="text-xs font-semibold">{formatCurrency(employees?.average_salary || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deduction Files & Requests */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Deduction Files</p>
                <p className="text-sm font-semibold">{deductionFiles?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-600">Pending Approval</p>
                <p className="text-sm font-semibold">{deductionFiles?.pending_approval || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Deduction Requests</p>
                <p className="text-sm font-semibold">{deductionRequests?.total_for_employer || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-gray-600">Approval Rate</p>
                <p className="text-sm font-semibold">{deductionFiles?.approval_rate || '0%'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Processing & Financial Summary */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Processing Records</p>
                <p className="text-sm font-semibold">{batchProcessing?.current_batch_records || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Processed</p>
                <p className="text-sm font-semibold">{batchProcessing?.processed_records || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Banknote className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Total Files Value</p>
                <p className="text-xs font-semibold">{formatCurrency(financial?.total_file_value || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-600">Pending Value</p>
                <p className="text-xs font-semibold">{formatCurrency(financial?.pending_file_value || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">File Uploads</p>
                  <p className="text-sm font-semibold">{recentActivity.file_uploads_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-600">File Approvals</p>
                  <p className="text-sm font-semibold">{recentActivity.file_approvals_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-600">Deduction Requests</p>
                  <p className="text-sm font-semibold">{recentActivity.deduction_requests_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-600">Employees Added</p>
                  <p className="text-sm font-semibold">{recentActivity.employees_added_last_30_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-600">Processing Records</p>
                  <p className="text-sm font-semibold">{recentActivity.processing_records_last_7_days || 0}</p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDefaultDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to PayFlow Malawi, {user.fullName}
        </p>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Dashboard content for {user.role} role is being configured.
        </p>
      </div>
    </div>
  );

  // Determine dashboard based on institution type and user role
  const getDashboardComponent = () => {
    // HUB institutions get the super admin dashboard with institution management
    if (user.institution?.type === 'HUB') {
      return renderSuperAdminDashboard();
    }

    // Super admin always gets the platform dashboard (legacy support)
    if (user.institutionId === '00000000-0000-0000-0000-000000000000') {
      return renderSuperAdminDashboard();
    }

    // SACCO users get the SACCO dashboard (check both role and institution type)
    if (user.role === 'SACCO_ADMIN' || user.institution?.type === 'SACCO' || user.institution?.type === 'FINANCIAL_INSTITUTION') {
      return renderSaccoDashboard();
    }

    // EMPLOYER users get the employer dashboard with HR modules
    if (user.role === 'EMPLOYER_ADMIN' || user.institution?.type === 'EMPLOYER') {
      return renderEmployerDashboard();
    }

    return renderDefaultDashboard();
  };

  return getDashboardComponent();
};