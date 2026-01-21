import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Loader2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';

import {
  deductionRequestService,
  CreateDeductionRequest,
  DeductionRequest,
  Employee,
  DeductionType,
  AffordabilityResponse
} from '@/services/deductionRequestService';

interface CreateDeductionFormData {
  employee_id: string;
  employer_institution_id: string;
  deduction_type: string;
  amount: string;
  external_reference: string;
  reason: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  number_of_months: string;
  is_reservation: boolean;
}

export const RequestDeduction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [deductionRequests, setDeductionRequests] = useState<DeductionRequest[]>([]);
  const [requestStats, setRequestStats] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deductionTypes, setDeductionTypes] = useState<DeductionType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [affordabilityData, setAffordabilityData] = useState<AffordabilityResponse | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DeductionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);
  const [isCheckingAffordability, setIsCheckingAffordability] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState<CreateDeductionFormData>({
    employee_id: '',
    employer_institution_id: '',
    deduction_type: '',
    amount: '',
    external_reference: '',
    reason: '',
    start_date: undefined,
    end_date: undefined,
    number_of_months: '',
    is_reservation: false
  });

  // Get current institution ID from localStorage (same as InstitutionMembers page)
  const currentInstitutionId = localStorage.getItem('payflow_institution_id') || '18211c81-425f-4723-ac0f-06801e7e3cba';
  const institutionId = currentInstitutionId; // Use the same logic as Members page

  // Debug logging
  useEffect(() => {
    console.log('RequestDeduction - User object:', user);
    console.log('RequestDeduction - User Institution ID:', user?.institutionId);
    console.log('RequestDeduction - Current Institution ID (from localStorage):', currentInstitutionId);
    console.log('RequestDeduction - Using Institution ID:', institutionId);
    console.log('RequestDeduction - User institution:', user?.institution);
  }, [user, institutionId, currentInstitutionId]);

  // Load data on component mount
  useEffect(() => {
    if (institutionId) {
      console.log('Loading initial data for institutionId:', institutionId);
      loadData();
    } else {
      console.log('No institutionId available, skipping data load');
    }
  }, [institutionId]); // Using the same institutionId logic as Members page

  // Automatically calculate end date when start date or number of months changes
  useEffect(() => {
    if (formData.start_date && formData.number_of_months) {
      const months = parseInt(formData.number_of_months);
      if (!isNaN(months) && months > 0) {
        const endDate = addMonths(formData.start_date, months);
        setFormData(prev => ({ ...prev, end_date: endDate }));
      }
    }
  }, [formData.start_date, formData.number_of_months]);

  const loadData = async () => {
    if (!institutionId) {
      console.log('loadData - No institutionId available');
      return;
    }
    
    try {
      console.log('loadData - Using institutionId from localStorage (same as Members page):', institutionId);
      setIsLoading(true);
      const requestsResponse = await deductionRequestService.getDeductionRequests();

      setDeductionRequests(requestsResponse.requests);
      setRequestStats(requestsResponse.stats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load deduction requests. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadModalData = async () => {
    try {
      setIsLoadingModal(true);
      // Set the predefined deduction types
      const predefinedTypes: DeductionType[] = [
        { value: 'SHARE', label: 'Share' },
        { value: 'LOAN_REPAYMENT', label: 'Loan Repayment' },
        { value: 'FINE', label: 'Fine' },
        { value: 'INSURANCE', label: 'Insurance' },
        { value: 'OTHER', label: 'Other' }
      ];
      setDeductionTypes(predefinedTypes);
      console.log('Modal data loaded successfully');
    } catch (error) {
      console.error('Error loading modal data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load deduction types. Please try again."
      });
      setDeductionTypes([]);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const handleOpenCreateDialog = () => {
    console.log('Opening create dialog');
    setIsCreateDialogOpen(true);
    loadModalData();
  };

  const handleEmployeeSearch = async (query: string) => {
    if (!query.trim()) {
      setEmployees([]);
      return;
    }

    try {
      setIsSearchingEmployees(true);
      const searchResults = await deductionRequestService.searchEmployees(query);
      console.log('Employee search results:', searchResults);
      setEmployees(searchResults);
    } catch (error) {
      console.error('Error searching employees:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search employees. Please try again."
      });
      setEmployees([]);
    } finally {
      setIsSearchingEmployees(false);
    }
  };

  const handleEmployeeSelect = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData(prev => ({
      ...prev,
      employee_id: employee.id,
      employer_institution_id: employee.employer.id
    }));

    // Check affordability if amount is already entered
    if (formData.amount) {
      await checkAffordability(employee.id, parseFloat(formData.amount));
    }
  };

  const checkAffordability = async (employeeId: string, requestedAmount: number) => {
    try {
      setIsCheckingAffordability(true);
      const affordability = await deductionRequestService.checkAffordability({
        employee_id: employeeId,
        requested_amount: requestedAmount
      });
      console.log('Affordability check result:', affordability);
      setAffordabilityData(affordability);
    } catch (error) {
      console.error('Error checking affordability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check affordability. Please try again."
      });
      setAffordabilityData(null);
    } finally {
      setIsCheckingAffordability(false);
    }
  };

  const handleAmountChange = async (value: string) => {
    setFormData(prev => ({ ...prev, amount: value }));

    // Check affordability when both employee and amount are selected
    if (selectedEmployee && value && parseFloat(value) > 0) {
      await checkAffordability(selectedEmployee.id, parseFloat(value));
    } else {
      setAffordabilityData(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: React.ComponentType<any> }> = {
      APPROVED: { class: 'bg-green-100 text-green-800', icon: CheckCircle },
      PROCESSING: { class: 'bg-blue-100 text-blue-800', icon: AlertTriangle }
    };

    const variant = variants[status] || { class: 'bg-gray-100 text-gray-800', icon: Clock };
    const IconComponent = variant.icon;

    return (
      <Badge className={variant.class}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status === 'APPROVED' ? 'Active' : status === 'PROCESSING' ? 'Processing' : status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateDeduction = async () => {
    // Validation
    if (!formData.employee_id || !selectedEmployee ||
        !formData.deduction_type || formData.deduction_type === 'no-types' ||
        !formData.amount || !formData.reason || !formData.start_date || !formData.number_of_months) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields including number of months."
      });
      return;
    }

    try {
      setIsCreating(true);

      const createRequest: CreateDeductionRequest = {
        employee_id: formData.employee_id,
        employer_institution_id: formData.employer_institution_id,
        deduction_type: formData.deduction_type,
        amount: parseFloat(formData.amount),
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : undefined,
        number_of_installments: formData.number_of_months ? parseInt(formData.number_of_months) : 1,
        reason: formData.reason,
        external_reference: formData.external_reference || undefined
      };

      console.log('Creating deduction request with employee:', selectedEmployee);
      console.log('Final payload:', createRequest);

      const newRequest = await deductionRequestService.createDeductionRequest(createRequest);
      setDeductionRequests(prev => [newRequest, ...prev]);

      toast({
        title: "Success",
        description: "Deduction request created successfully."
      });

      // Reset form and close dialog
      setFormData({
        employee_id: '',
        employer_institution_id: '',
        deduction_type: '',
        amount: '',
        external_reference: '',
        reason: '',
        start_date: undefined,
        end_date: undefined,
        number_of_months: '',
        is_reservation: false
      });
      setSelectedEmployee(null);
      setAffordabilityData(null);
      setEmployees([]);
      setEmployeeSearchQuery('');
      setIsCreateDialogOpen(false);

      // Reload data
      await loadData();

    } catch (error) {
      console.error('Error creating deduction request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create deduction request. Please try again."
      });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredRequests = deductionRequests.filter(request => {
    const matchesSearch = searchTerm === '' ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || request.request_status === filterStatus;
    const matchesType = filterType === 'all' || request.deduction_type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Request Deduction</h1>
          <p className="text-muted-foreground mt-1">Submit and track deduction requests for employees</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                New Deduction/Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {formData.is_reservation ? "Create Deduction Reservation" : "Create Deduction Request"}
                </DialogTitle>
                <DialogDescription>
                  {formData.is_reservation
                    ? "Reserve a future deduction for an institution member"
                    : "Submit a new deduction request for an institution member"
                  }
                </DialogDescription>
              </DialogHeader>
              
              {isLoadingModal ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading members and deduction types...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="employee">Search Employee by National ID or Employee Number *</Label>
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="employee"
                            value={employeeSearchQuery}
                            onChange={(e) => {
                              setEmployeeSearchQuery(e.target.value);
                              handleEmployeeSearch(e.target.value);
                            }}
                            placeholder="Enter National ID or Employee Number (e.g., MWI123456 or TNM-0001)"
                            className="pl-10"
                          />
                          {isSearchingEmployees && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                          )}
                        </div>

                        {selectedEmployee && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-green-800">{selectedEmployee.full_name}</p>
                                <p className="text-sm text-green-600">
                                  {selectedEmployee.employee_number} | National ID: {selectedEmployee.national_id} | {selectedEmployee.email}
                                </p>
                                {selectedEmployee.basic_salary && (
                                  <p className="text-sm text-green-600">
                                    Salary: {formatCurrency(parseFloat(selectedEmployee.basic_salary))}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(null);
                                  setFormData(prev => ({ ...prev, employee_id: '', employer_institution_id: '' }));
                                  setAffordabilityData(null);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {employees.length > 0 && !selectedEmployee && (
                          <div className="border rounded-md max-h-48 overflow-y-auto">
                            {employees.map((employee) => (
                              <div
                                key={employee.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleEmployeeSelect(employee)}
                              >
                                <p className="font-medium">{employee.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {employee.employee_number} | National ID: {employee.national_id} | {employee.email}
                                </p>
                                {employee.basic_salary && (
                                  <p className="text-sm text-muted-foreground">
                                    Salary: {formatCurrency(parseFloat(employee.basic_salary))}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deductionType">Deduction Type *</Label>
                      <Select
                        value={formData.deduction_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, deduction_type: value }))}
                        disabled={!selectedEmployee}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedEmployee ? "Select employee first" : "Select type"} />
                        </SelectTrigger>
                        <SelectContent>
                          {deductionTypes.length === 0 ? (
                            <SelectItem value="no-types" disabled>No deduction types found</SelectItem>
                          ) : (
                            deductionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isReservation"
                          checked={formData.is_reservation}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_reservation: checked }))}
                          disabled={!selectedEmployee}
                        />
                        <Label htmlFor="isReservation" className={`text-sm font-medium ${!selectedEmployee ? 'text-muted-foreground' : ''}`}>
                          This is a reservation
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formData.is_reservation
                          ? "Creating a reservation for future deduction"
                          : "Creating an immediate deduction request"
                        }
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (MWK) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder={!selectedEmployee ? "Select employee first" : "50000"}
                        min="0"
                        step="0.01"
                        disabled={!selectedEmployee}
                      />
                      {isCheckingAffordability && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Checking affordability...
                        </div>
                      )}
                      {affordabilityData && (
                        <div className={`p-3 rounded-md border ${
                          affordabilityData.data.affordability_assessment.can_afford
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">Affordability Assessment</h4>
                            <Badge className={
                              affordabilityData.data.affordability_assessment.can_afford
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {affordabilityData.data.affordability_assessment.assessment_result}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Basic Salary:</span>
                              <span>{formatCurrency(affordabilityData.data.affordability_assessment.basic_salary)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Existing Deductions:</span>
                              <span>{formatCurrency(affordabilityData.data.affordability_assessment.existing_deductions)} ({affordabilityData.data.affordability_assessment.existing_deduction_percentage}%)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Requested Amount:</span>
                              <span>{formatCurrency(affordabilityData.data.affordability_assessment.requested_amount)} ({affordabilityData.data.affordability_assessment.requested_deduction_percentage}%)</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Net Salary After:</span>
                              <span>{formatCurrency(affordabilityData.data.affordability_assessment.net_salary_after_deduction)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Risk Level:</span>
                              <span className={`font-medium ${
                                affordabilityData.data.affordability_assessment.risk_level === 'LOW' ? 'text-green-600' :
                                affordabilityData.data.affordability_assessment.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {affordabilityData.data.affordability_assessment.risk_level} ({affordabilityData.data.affordability_assessment.risk_score}%)
                              </span>
                            </div>
                          </div>
                          {affordabilityData.data.recommendation && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {affordabilityData.data.recommendation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="externalReference">External Reference</Label>
                      <Input
                        id="externalReference"
                        value={formData.external_reference}
                        onChange={(e) => setFormData(prev => ({ ...prev, external_reference: e.target.value }))}
                        placeholder={!selectedEmployee ? "Select employee first" : "REF-001-2025"}
                        disabled={!selectedEmployee}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numberOfMonths">Number of Months</Label>
                      <Input
                        id="numberOfMonths"
                        type="number"
                        value={formData.number_of_months}
                        onChange={(e) => setFormData(prev => ({ ...prev, number_of_months: e.target.value }))}
                        placeholder={!selectedEmployee ? "Select employee first" : "12"}
                        min="1"
                        disabled={!selectedEmployee}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.start_date && "text-muted-foreground"
                            )}
                            disabled={!selectedEmployee}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.start_date ? format(formData.start_date, "PPP") : !selectedEmployee ? "Select employee first" : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.start_date}
                            onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (Auto-calculated)</Label>
                      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formData.end_date ? format(formData.end_date, "PPP") : "Will be calculated based on start date and number of months"}
                        </span>
                      </div>
                    </div>

                    {/* Deduction Summary */}
                    {formData.amount && formData.number_of_months && formData.start_date && formData.end_date && (
                      <div className="md:col-span-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Deduction Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Monthly Amount:</span>
                            <p className="font-medium">{formatCurrency(parseFloat(formData.amount))}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Number of Months:</span>
                            <p className="font-medium">{formData.number_of_months} months</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <p className="font-medium">
                              {format(formData.start_date, "MMM yyyy")} - {format(formData.end_date, "MMM yyyy")}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Amount on Maturity:</span>
                            <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                              {formatCurrency(parseFloat(formData.amount) * parseInt(formData.number_of_months))}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="reason">Reason *</Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder={!selectedEmployee ? "Select employee first" : "Describe the purpose of this deduction request"}
                        rows={3}
                        disabled={!selectedEmployee}
                      />
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateDeduction}
                      disabled={isCreating || !formData.employee_id || !selectedEmployee ||
                               !formData.deduction_type || formData.deduction_type === 'no-types' ||
                               !formData.amount || !formData.reason || !formData.start_date || !formData.number_of_months}
                    >
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isCreating
                        ? 'Creating...'
                        : formData.is_reservation
                          ? 'Create Reservation'
                          : 'Create Request'
                      }
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{deductionRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{deductionRequests.filter(r => r.status === 'APPROVED').length}</p>
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
              placeholder="Search by employee name, number, or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="APPROVED">Active</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Loan Repayment">Loan Repayment</SelectItem>
            <SelectItem value="Insurance Premium">Insurance Premium</SelectItem>
            <SelectItem value="Tax Deduction">Tax Deduction</SelectItem>
            <SelectItem value="Pension Contribution">Pension Contribution</SelectItem>
            <SelectItem value="Medical Contribution">Medical Contribution</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deduction Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>Track and manage all deduction requests</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No requests found</h4>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' ? 
                  'No requests match your current filters.' : 
                  'Start by creating your first deduction request.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Details</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="mb-1">{request.request_number || request.id.slice(0, 8)}</Badge>
                        <p className="text-xs text-muted-foreground">ID: {request.id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {request.employee ? (
                          <>
                            <p className="font-medium">{request.employee.full_name}</p>
                            <p className="text-sm text-muted-foreground">#{request.employee.employee_number}</p>
                            <p className="text-xs text-muted-foreground">{request.employee.email}</p>
                            {request.employee.basic_salary && (
                              <p className="text-xs text-muted-foreground">
                                Salary: {formatCurrency(parseFloat(request.employee.basic_salary))}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="font-medium">Employee ID: {request.employee_id.slice(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">Details not available</p>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{request.deduction_type}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(request.amount))}</TableCell>
                    <TableCell>{getStatusBadge(request.request_status)}</TableCell>
                    <TableCell>{formatDate(request.requested_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedRequest(request);
                            setIsViewDialogOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Request
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Detailed information for request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request ID</Label>
                  <p className="text-sm">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employee Name</Label>
                  <p className="text-sm">
                    {selectedRequest.employee ? selectedRequest.employee.full_name : `Employee ID: ${selectedRequest.employee_id.slice(0, 8)}...`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employee Number</Label>
                  <p className="text-sm">
                    {selectedRequest.employee ? selectedRequest.employee.employee_number : 'Not available'}
                  </p>
                </div>
              </div>

              {selectedRequest.employee && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee Email</Label>
                    <p className="text-sm">{selectedRequest.employee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Basic Salary</Label>
                    <p className="text-sm">
                      {selectedRequest.employee.basic_salary ? formatCurrency(parseFloat(selectedRequest.employee.basic_salary)) : 'Not available'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Number</Label>
                  <p className="text-sm">{selectedRequest.memberNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Institution</Label>
                  <p className="text-sm">{selectedRequest.employerInstitutionName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Deduction Type</Label>
                  <p className="text-sm">{selectedRequest.deductionType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="text-sm">{formatCurrency(selectedRequest.amount)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="text-sm">{formatDate(selectedRequest.start_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="text-sm">{selectedRequest.endDate ? formatDate(selectedRequest.endDate) : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Installments</Label>
                  <p className="text-sm">{selectedRequest.number_of_installments || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">External Reference</Label>
                  <p className="text-sm">{selectedRequest.external_reference || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                  <p className="text-sm">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{formatDate(selectedRequest.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};