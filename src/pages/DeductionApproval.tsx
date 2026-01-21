import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Eye,
  Search,
  Download,
  Loader2,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { deductionRequestService, DeductionRequest } from '@/services/deductionRequestService';

interface ActiveDeduction {
  id: string;
  requestNumber: string;
  employeeName: string;
  employeeNumber: string;
  memberNumber: string;
  deductionType: string;
  amount: number;
  monthlyAmount: number;
  startDate: string;
  endDate?: string;
  numberOfInstallments: number;
  remainingInstallments: number;
  lastPaidDate?: string;
  nextPaymentDate: string;
  totalPaid: number;
  remainingBalance: number;
  status: 'Active';
  externalReference: string;
  reason: string;
  employerInstitutionName?: string;
}

// Mock data for active deductions
const mockActiveDeductions: ActiveDeduction[] = [
  {
    id: '1',
    requestNumber: 'DED-2024-001',
    employeeName: 'John Doe',
    employeeNumber: 'EMP001',
    memberNumber: 'MBR001',
    deductionType: 'LOAN',
    amount: 500000,
    monthlyAmount: 50000,
    startDate: '2024-01-01',
    endDate: '2024-10-01',
    numberOfInstallments: 10,
    remainingInstallments: 6,
    lastPaidDate: '2024-04-01',
    nextPaymentDate: '2024-05-01',
    totalPaid: 200000,
    remainingBalance: 300000,
    status: 'Active',
    externalReference: 'LOAN-001',
    reason: 'Emergency loan',
    employerInstitutionName: 'Ministry of Health'
  },
  {
    id: '2',
    requestNumber: 'DED-2024-002',
    employeeName: 'Jane Smith',
    employeeNumber: 'EMP002',
    memberNumber: 'MBR002',
    deductionType: 'SHARE',
    amount: 240000,
    monthlyAmount: 20000,
    startDate: '2024-02-01',
    numberOfInstallments: 12,
    remainingInstallments: 9,
    lastPaidDate: '2024-04-01',
    nextPaymentDate: '2024-05-01',
    totalPaid: 60000,
    remainingBalance: 180000,
    status: 'Active',
    externalReference: 'SHARE-002',
    reason: 'Monthly share contribution',
    employerInstitutionName: 'Ministry of Health'
  },
  {
    id: '3',
    requestNumber: 'DED-2024-003',
    employeeName: 'Mike Johnson',
    employeeNumber: 'EMP003',
    memberNumber: 'MBR003',
    deductionType: 'SAVINGS',
    amount: 360000,
    monthlyAmount: 30000,
    startDate: '2024-01-15',
    numberOfInstallments: 12,
    remainingInstallments: 8,
    lastPaidDate: '2024-04-15',
    nextPaymentDate: '2024-05-15',
    totalPaid: 120000,
    remainingBalance: 240000,
    status: 'Active',
    externalReference: 'SAV-003',
    reason: 'Regular savings',
    employerInstitutionName: 'Ministry of Health'
  }
];

export const DeductionApproval = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deductions, setDeductions] = useState<DeductionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<DeductionRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadDeductions();
  }, []);

  const loadDeductions = async (status = 'APPROVED', type?: string, search?: string, limit = 50, page = 1) => {
    try {
      setLoading(true);
      const response = await deductionRequestService.getReceivedDeductionRequests(
        status,
        type !== 'all' ? type : undefined,
        search || undefined,
        limit,
        page
      );
      setDeductions(response.requests);
      setStats(response.stats);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading deductions:', error);
      toast({
        title: "Error",
        description: "Failed to load deductions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDeductions('APPROVED', filterType, searchTerm);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Since we're filtering on the server side now, just use all deductions
  const filteredDeductions = deductions;

  const handleExportToExcel = () => {
    // Create CSV content
    const headers = [
      'Request Number',
      'Employee Name',
      'Employee Number',
      'Employee Email',
      'Deduction Type',
      'Total Amount',
      'Monthly Amount',
      'Start Date',
      'End Date',
      'Total Installments',
      'Remaining Installments',
      'Status',
      'External Reference',
      'Reason'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredDeductions.map(deduction => [
        deduction.request_number,
        `"${deduction.employee?.full_name || 'N/A'}"`,
        deduction.employee?.employee_number || 'N/A',
        deduction.employee?.email || 'N/A',
        deduction.deduction_type,
        parseFloat(deduction.amount),
        parseFloat(deduction.amount) / deduction.number_of_installments,
        deduction.start_date,
        deduction.end_date || '',
        deduction.number_of_installments,
        deduction.remaining_installments,
        deduction.request_status,
        deduction.external_reference || '',
        `"${deduction.reason}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `received_deductions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Received deductions have been exported to Excel format.",
    });
  };

  const getTotalAmounts = () => {
    const totalAmount = filteredDeductions.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const monthlyTotal = filteredDeductions.reduce((sum, d) => {
      const monthlyAmount = parseFloat(d.amount) / d.number_of_installments;
      return sum + monthlyAmount;
    }, 0);

    return { totalAmount, monthlyTotal, count: filteredDeductions.length };
  };

  const { totalAmount, monthlyTotal, count } = getTotalAmounts();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deductions to Us</h1>
          <p className="text-muted-foreground mt-1">Active deductions and payments we need to collect from employees</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Deductions</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Monthly Collections</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Approved Value</p>
                <p className="text-2xl font-bold">{stats?.total_approved_amount ? formatCurrency(parseFloat(stats.total_approved_amount)) : formatCurrency(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by employee name, number, or request number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="LOAN_REPAYMENT">Loan Repayment</SelectItem>
            <SelectItem value="SHARE_CONTRIBUTION">Share Contribution</SelectItem>
            <SelectItem value="SAVINGS_CONTRIBUTION">Savings Contribution</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Deductions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Received Deductions ({filteredDeductions.length})</CardTitle>
          <CardDescription>Approved deduction requests from our institution members</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading deductions...</span>
            </div>
          ) : filteredDeductions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No received deductions</h4>
              <p className="text-muted-foreground mb-4">
                No deduction requests found matching your search criteria.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Number</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Installments</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeductions.map((deduction) => (
                  <TableRow key={deduction.id}>
                    <TableCell>
                      <Badge variant="outline">{deduction.request_number}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deduction.employee?.full_name || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{deduction.employee?.employee_number || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{deduction.deduction_type}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(parseFloat(deduction.amount))}</TableCell>
                    <TableCell>{deduction.number_of_installments} / {deduction.remaining_installments} remaining</TableCell>
                    <TableCell>{formatDate(deduction.start_date)}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {deduction.request_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDeduction(deduction);
                          setIsViewDialogOpen(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Deduction Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deduction Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedDeduction?.request_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeduction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Employee & Request Information</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Request Number</Label>
                    <p className="text-sm">{selectedDeduction.request_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee</Label>
                    <p className="text-sm flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {selectedDeduction.employee?.full_name || 'N/A'} ({selectedDeduction.employee?.employee_number || 'N/A'})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee Email</Label>
                    <p className="text-sm">{selectedDeduction.employee?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Deduction Type</Label>
                    <p className="text-sm">{selectedDeduction.deduction_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">External Reference</Label>
                    <p className="text-sm">{selectedDeduction.external_reference || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                    <p className="text-sm">{selectedDeduction.reason}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2">Payment Schedule</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                    <p className="text-sm font-semibold">{formatCurrency(parseFloat(selectedDeduction.amount))}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Monthly Amount</Label>
                    <p className="text-sm font-semibold text-blue-600">{formatCurrency(parseFloat(selectedDeduction.amount) / selectedDeduction.number_of_installments)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p className="text-sm">{formatDate(selectedDeduction.start_date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                    <p className="text-sm">{selectedDeduction.end_date ? formatDate(selectedDeduction.end_date) : 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Installments</Label>
                    <p className="text-sm">{selectedDeduction.number_of_installments}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Remaining Installments</Label>
                    <p className="text-sm font-semibold text-orange-600">{selectedDeduction.remaining_installments}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Requested At</Label>
                    <p className="text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(selectedDeduction.requested_at)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Approved At</Label>
                    <p className="text-sm">{selectedDeduction.approved_at ? formatDate(selectedDeduction.approved_at) : 'Not yet approved'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {selectedDeduction.request_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};