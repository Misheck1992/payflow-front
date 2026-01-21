import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { mockDashboardData } from '@/lib/mockData';
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
  Banknote
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderSuperAdminDashboard = () => {
    const data = mockDashboardData.SUPER_ADMIN;
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground mt-2">
            Monitor the entire PayFlow Malawi ecosystem
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Institutions"
            value={data.totalInstitutions}
            change={{ value: "+12% from last month", type: "increase" }}
            icon={Building}
          />
          <StatCard
            title="Active Users"
            value={data.activeUsers}
            change={{ value: "+5% from last month", type: "increase" }}
            icon={Users}
          />
          <StatCard
            title="Monthly Transactions"
            value={data.monthlyTransactions.toLocaleString()}
            change={{ value: "+8% from last month", type: "increase" }}
            icon={TrendingUp}
          />
          <StatCard
            title="System Uptime"
            value={data.systemUptime}
            change={{ value: "99.9% this month", type: "neutral" }}
            icon={Activity}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity activities={data.recentActivity.map(item => ({
            ...item,
            type: item.type as 'info' | 'success' | 'warning' | 'error'
          }))} />
          <div className="space-y-4">
            {/* Additional platform metrics can go here */}
          </div>
        </div>
      </div>
    );
  };

  const renderEmployerDashboard = () => {
    const data = mockDashboardData.EMPLOYER_ADMIN;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage employees and HR operations for {user.institution.name}
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
    const data = mockDashboardData.SACCO_ADMIN;

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
            value={data.nextScheduledCollections}
            change={{ value: "Due next week", type: "neutral" }}
            icon={Target}
            color="indigo"
            prefix="MWK "
          />
          <StatCard
            title="Payments Collected"
            value={data.totalPaymentsCollected}
            change={{ value: `${data.collectionRate}% collection rate`, type: "increase" }}
            icon={ArrowDownCircle}
            color="green"
            prefix="MWK "
          />
          <StatCard
            title="Deduction Requests"
            value={data.totalDeductionRequests}
            change={{ value: "+23 new requests", type: "increase" }}
            icon={FileText}
            color="orange"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <StatCard
            title="Collection Rate"
            value={data.collectionRate}
            change={{ value: "+2.3% improvement", type: "increase" }}
            icon={Percent}
            color="purple"
            suffix="%"
          />
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity
            activities={data.recentActivity.map(item => ({
              ...item,
              type: item.type as 'info' | 'success' | 'warning' | 'error'
            }))}
            title="Recent Financial Activity"
          />
          <div className="space-y-4">
            {/* Additional SACCO-specific widgets can go here */}
          </div>
        </div>
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
    // Super admin always gets the platform dashboard
    if (user.institutionId === '00000000-0000-0000-0000-000000000000') {
      return renderSuperAdminDashboard();
    }

    // SACCO institutions get the SACCO dashboard
    if (user.institution?.type === 'SACCO') {
      return renderSaccoDashboard();
    }

    // Employer institutions get the employer dashboard
    if (user.role === 'EMPLOYER_ADMIN') {
      return renderEmployerDashboard();
    }

    return renderDefaultDashboard();
  };

  return getDashboardComponent();
};