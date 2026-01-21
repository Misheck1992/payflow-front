import React, { useState, useEffect } from 'react';
import {
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  User,
  Loader2,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Percent,
  FileText,
  CalendarIcon,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  deductionRequestService,
  Employee,
  DeductionType,
  CreateDeductionRequest
} from '@/services/deductionRequestService';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const wizardSteps: WizardStep[] = [
  {
    id: 1,
    title: "Search Employee",
    description: "Find the employee by National ID or Employee Number"
  },
  {
    id: 2,
    title: "Enter Amount",
    description: "Specify the deduction amount to check"
  },
  {
    id: 3,
    title: "Affordability Result",
    description: "Review the affordability assessment"
  }
];

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

export const AffordabilityCheck = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Employee search state
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Amount input state
  const [amount, setAmount] = useState('');

  // Affordability check state
  const [affordabilityResult, setAffordabilityResult] = useState<any | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Create deduction modal state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deductionTypes, setDeductionTypes] = useState<DeductionType[]>([]);
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

  // Get institution ID from localStorage
  const currentInstitutionId = localStorage.getItem('payflow_institution_id') || user?.institutionId || '18211c81-425f-4723-ac0f-06801e7e3cba';

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

  const handleSearchEmployees = async () => {
    if (!employeeSearchTerm.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a National ID or Employee Number to search."
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await deductionRequestService.searchEmployees(employeeSearchTerm.trim());
      setSearchResults(results);

      if (results.length === 0) {
        toast({
          variant: "destructive",
          title: "No Results",
          description: "No employees found matching your search criteria."
        });
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search employees. Please try again."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEmployee = (employee: EmployeeSearchResult) => {
    console.log('Selecting employee:', employee);
    setSelectedEmployee(employee);
    setCurrentStep(2);
  };

  const handleCheckAffordability = async () => {
    if (!selectedEmployee) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No employee selected."
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (!amount.trim() || isNaN(amountValue) || amountValue <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount."
      });
      return;
    }

    setIsChecking(true);
    try {
      const requestData = {
        employee_id: selectedEmployee.id,
        requested_amount: amountValue
      };
      const result = await deductionRequestService.checkAffordability(requestData);
      console.log('Affordability API response:', result);
      // Extract data from the API response
      setAffordabilityResult(result.data);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error checking affordability:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check affordability. Please try again."
      });
    } finally {
      setIsChecking(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + '%';
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setEmployeeSearchTerm('');
    setSearchResults([]);
    setSelectedEmployee(null);
    setAmount('');
    setAffordabilityResult(null);
  };

  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenCreateDialog = () => {
    if (!selectedEmployee || !affordabilityResult) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete affordability check first."
      });
      return;
    }

    // Pre-fill form with employee and amount data
    setFormData({
      employee_id: selectedEmployee.id,
      employer_institution_id: selectedEmployee.employer.id,
      deduction_type: '',
      amount: amount,
      external_reference: '',
      reason: '',
      start_date: undefined,
      end_date: undefined,
      number_of_months: '',
      is_reservation: false
    });

    // Set the predefined deduction types
    const predefinedTypes: DeductionType[] = [
      { value: 'SHARE', label: 'Share' },
      { value: 'LOAN_REPAYMENT', label: 'Loan Repayment' },
      { value: 'FINE', label: 'Fine' },
      { value: 'INSURANCE', label: 'Insurance' },
      { value: 'OTHER', label: 'Other' }
    ];
    setDeductionTypes(predefinedTypes);
    setIsCreateDialogOpen(true);
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

      console.log('Creating deduction request:', createRequest);

      await deductionRequestService.createDeductionRequest(createRequest);

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
      setIsCreateDialogOpen(false);
      resetWizard();

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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Affordability Check</h1>
        <p className="text-muted-foreground mt-2">
          Check if an employee can afford a specific deduction amount
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {wizardSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= step.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
            {index < wizardSteps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Employee Search */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Employee
            </CardTitle>
            <CardDescription>
              Enter the National ID or Employee Number to find the employee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="employeeSearch">National ID or Employee Number</Label>
                <Input
                  id="employeeSearch"
                  placeholder="Enter National ID or Employee Number (e.g., MWI123456 or TNM-0001)"
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchEmployees()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearchEmployees} 
                  disabled={isSearching}
                  className="min-w-[100px]"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Search Results</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Number</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Badge variant="outline">{employee.employee_number}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{employee.national_id || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {employee.full_name}
                          </div>
                        </TableCell>
                        <TableCell>{employee.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="default">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectEmployee(employee)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Amount Input */}
      {currentStep === 2 && selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Enter Deduction Amount
            </CardTitle>
            <CardDescription>
              Specify the amount to check affordability for {selectedEmployee.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Employee Info */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Selected Employee
                </h4>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Employee Number</Label>
                  <p className="font-medium">{selectedEmployee.employee_number}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">National ID</Label>
                  <p className="font-medium">{selectedEmployee.national_id || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedEmployee.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedEmployee.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone Number</Label>
                  <p className="font-medium">{selectedEmployee.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Employment Status</Label>
                  <p className="font-medium">{selectedEmployee.employment_status || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Deduction Amount (MWK)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (e.g., 50000)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={goToPreviousStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleCheckAffordability} 
                disabled={isChecking || !amount.trim()}
                className="min-w-[150px]"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Check Affordability
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Affordability Result */}
      {currentStep === 3 && affordabilityResult && (
        <div className="space-y-6">
          {/* Employee Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{affordabilityResult.employee?.full_name || selectedEmployee?.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Employee Number</Label>
                  <p className="font-medium">{affordabilityResult.employee?.employee_number || selectedEmployee?.employee_number}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">National ID</Label>
                  <p className="font-medium">{selectedEmployee?.national_id || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedEmployee?.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone Number</Label>
                  <p className="font-medium">{selectedEmployee?.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Employment Status</Label>
                  <Badge variant="default">{selectedEmployee?.employment_status || 'ACTIVE'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {affordabilityResult.affordability_assessment?.can_afford ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                )}
                Affordability Result
              </CardTitle>
              <CardDescription>
                Assessment for {affordabilityResult.employee?.full_name} ({affordabilityResult.employee?.employee_number})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className={affordabilityResult.affordability_assessment?.can_afford ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {affordabilityResult.affordability_assessment?.can_afford
                    ? `The employee can afford the requested deduction of ${formatCurrency(affordabilityResult.requested_deduction?.amount)}.`
                    : `The employee cannot afford the requested deduction. ${affordabilityResult.recommendation || 'Insufficient funds after existing deductions.'}`
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Existing Deductions */}
          {affordabilityResult.existing_deductions?.details?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Existing Deductions ({affordabilityResult.existing_deductions.count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Institution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affordabilityResult.existing_deductions.details.map((deduction: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant="outline">{deduction.type.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(deduction.amount)}</TableCell>
                        <TableCell>{deduction.institution}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Detailed Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salary & Deduction Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Deduction Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-muted-foreground">Existing Deductions</Label>
                    <span className="font-medium">{formatCurrency(affordabilityResult.existing_deductions?.total_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <Label className="text-red-600 font-medium">Your Requested Amount</Label>
                    <span className="font-medium text-red-600">{formatCurrency(affordabilityResult.requested_deduction?.amount || 0)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <Label className="text-muted-foreground">Total Deductions</Label>
                    <span className="font-semibold">{formatCurrency(affordabilityResult.affordability_assessment?.total_deductions || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affordability Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Affordability Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-muted-foreground">Available Amount</Label>
                    <span className="font-medium">{formatCurrency(affordabilityResult.affordability_assessment?.available_amount || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Utilization Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Percent className="w-5 h-5 mr-2" />
                Deduction Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Deduction Percentage</span>
                  <span>{affordabilityResult.affordability_assessment?.total_deduction_percentage?.toFixed(2) || 0}% of affordable amount</span>
                </div>
                <Progress
                  value={affordabilityResult.affordability_assessment?.total_deduction_percentage || 0}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  Risk Level: <span className={`font-medium ${
                    affordabilityResult.affordability_assessment?.risk_level === 'LOW' ? 'text-green-600' :
                    affordabilityResult.affordability_assessment?.risk_level === 'MEDIUM' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{affordabilityResult.affordability_assessment?.risk_level}</span>
                  (Score: {affordabilityResult.affordability_assessment?.risk_score})
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={goToPreviousStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={resetWizard}>
                Check Another Employee
              </Button>
              {affordabilityResult.affordability_assessment?.can_afford && (
                <Button onClick={handleOpenCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deduction Request
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Deduction Request Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formData.is_reservation ? "Create Deduction Reservation" : "Create Deduction Request"}
            </DialogTitle>
            <DialogDescription>
              {formData.is_reservation
                ? "Reserve a future deduction for the employee"
                : "Submit a new deduction request for the employee"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Info Display */}
            <div className="md:col-span-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">{selectedEmployee?.full_name}</p>
                  <p className="text-sm text-green-600">
                    {selectedEmployee?.employee_number} | National ID: {selectedEmployee?.national_id} | {selectedEmployee?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductionType">Deduction Type *</Label>
              <Select
                value={formData.deduction_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, deduction_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
                />
                <Label htmlFor="isReservation" className="text-sm font-medium">
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
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="50000"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalReference">External Reference</Label>
              <Input
                id="externalReference"
                value={formData.external_reference}
                onChange={(e) => setFormData(prev => ({ ...prev, external_reference: e.target.value }))}
                placeholder="REF-001-2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfMonths">Number of Months *</Label>
              <Input
                id="numberOfMonths"
                type="number"
                value={formData.number_of_months}
                onChange={(e) => setFormData(prev => ({ ...prev, number_of_months: e.target.value }))}
                placeholder="12"
                min="1"
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
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
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
                placeholder="Describe the purpose of this deduction request"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateDeduction}
              disabled={isCreating || !formData.employee_id ||
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
        </DialogContent>
      </Dialog>
    </div>
  );
};