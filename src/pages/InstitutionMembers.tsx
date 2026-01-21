import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Search, Edit2, Trash2, Download, Filter, ArrowRight, ArrowLeft, User } from 'lucide-react';
import { cn } from '@/lib/utils';

import { institutionMembersService, InstitutionMember, CreateMemberRequest } from '@/services/institutionMembersService';
import { globalEmployeeService, GlobalEmployee } from '@/services/globalEmployeeService';
import { institutionService } from '@/services/institutionService';

const InstitutionMembers: React.FC = () => {
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<InstitutionMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [employeeSearchNumber, setEmployeeSearchNumber] = useState('');
  const [foundEmployee, setFoundEmployee] = useState<GlobalEmployee | null>(null);
  const [searchingEmployee, setSearchingEmployee] = useState(false);
  const [employeeSearchError, setEmployeeSearchError] = useState('');
  const [creatingMember, setCreatingMember] = useState(false);
  
  // Form states
  const [memberForm, setMemberForm] = useState<CreateMemberRequest>({
    employeeId: '',
    employerInstitutionId: '',
    memberNumber: '',
    membershipDate: new Date().toISOString().split('T')[0],
    membershipStatus: 'Active',
    shareBalance: 0
  });
  
  const [membershipDate, setMembershipDate] = useState<Date>(new Date());
  
  const { toast } = useToast();

  // Get current institution ID from localStorage or context
  const currentInstitutionId = localStorage.getItem('payflow_institution_id') || '18211c81-425f-4723-ac0f-06801e7e3cba';

  useEffect(() => {
    fetchMembers();
    fetchInstitutions();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await institutionMembersService.getInstitutionMembers(currentInstitutionId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch institution members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const data = await institutionService.getAllInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const searchEmployeeByNumber = async () => {
    if (!employeeSearchNumber.trim()) {
      setEmployeeSearchError('Please enter an employee number');
      return;
    }

    try {
      setSearchingEmployee(true);
      setEmployeeSearchError('');
      setFoundEmployee(null);
      
      const employees = await globalEmployeeService.searchEmployeeByNumber(employeeSearchNumber.trim());
      
      if (employees.length === 0) {
        setEmployeeSearchError('No employee found with this employee number');
        return;
      }
      
      // Take the first employee if multiple found
      const employee = employees[0];
      setFoundEmployee(employee);
      
      // Pre-fill form with employee data
      setMemberForm(prev => ({
        ...prev,
        employeeId: employee.id,
        employerInstitutionId: employee.institutionId
      }));
      
    } catch (error) {
      console.error('Error searching employee:', error);
      setEmployeeSearchError('Failed to search employee. Please try again.');
    } finally {
      setSearchingEmployee(false);
    }
  };

  const handleCreateMember = async () => {
    try {
      if (!foundEmployee) {
        toast({
          title: 'Error',
          description: 'No employee selected',
          variant: 'destructive',
        });
        return;
      }

      setCreatingMember(true);

      const memberData = {
        ...memberForm,
        membershipDate: format(membershipDate, 'yyyy-MM-dd'),
        employeeId: foundEmployee.id,
        employerInstitutionId: foundEmployee.institutionId
      };
      
      await institutionMembersService.createMember(currentInstitutionId, memberData);
      
      toast({
        title: 'Success',
        description: 'Member created successfully',
      });
      
      setIsCreateDialogOpen(false);
      fetchMembers();
    } catch (error) {
      console.error('Error creating member:', error);
      toast({
        title: 'Error',
        description: 'Failed to create member',
        variant: 'destructive',
      });
    } finally {
      setCreatingMember(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;
    
    try {
      const updateData = {
        memberNumber: memberForm.memberNumber,
        membershipDate: format(membershipDate, 'yyyy-MM-dd'),
        membershipStatus: memberForm.membershipStatus,
        shareBalance: memberForm.shareBalance
      };
      
      await institutionMembersService.updateMember(selectedMember.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
      
      setIsEditDialogOpen(false);
      setSelectedMember(null);
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      await institutionMembersService.deleteMember(memberId);
      
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });
      
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete member',
        variant: 'destructive',
      });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (open) {
      // Reset form when opening
      resetForm();
    }
  };

  const resetForm = () => {
    setMemberForm({
      employeeId: '',
      employerInstitutionId: '',
      memberNumber: '',
      membershipDate: new Date().toISOString().split('T')[0],
      membershipStatus: 'Active',
      shareBalance: 0
    });
    setMembershipDate(new Date());
    setWizardStep(1);
    setEmployeeSearchNumber('');
    setFoundEmployee(null);
    setEmployeeSearchError('');
    setCreatingMember(false);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const nextWizardStep = () => {
    if (wizardStep === 1 && foundEmployee) {
      setWizardStep(2);
    }
  };

  const previousWizardStep = () => {
    if (wizardStep === 2) {
      setWizardStep(1);
    }
  };

  const openEditDialog = (member: InstitutionMember) => {
    setSelectedMember(member);
    setMemberForm({
      employeeId: member.employeeId,
      employerInstitutionId: member.employerInstitutionId,
      memberNumber: member.memberNumber,
      membershipDate: member.membershipDate,
      membershipStatus: member.membershipStatus,
      shareBalance: member.shareBalance
    });
    setMembershipDate(new Date(member.membershipDate));
    setIsEditDialogOpen(true);
  };

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employerInstitutionName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || member.membershipStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Institution Members</h1>
          <p className="text-muted-foreground mt-1">Manage SACCO and financial institution members</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Member - Step {wizardStep} of 2</DialogTitle>
                <DialogDescription>
                  {wizardStep === 1 
                    ? "Search for an employee by employee number" 
                    : "Complete membership information"
                  }
                </DialogDescription>
              </DialogHeader>
              
              {/* Step 1: Employee Search */}
              {wizardStep === 1 && (
                <div className="grid gap-6 py-4">
                  <div className="grid gap-4">
                    <Label htmlFor="employeeNumber">Employee Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="employeeNumber"
                        value={employeeSearchNumber}
                        onChange={(e) => setEmployeeSearchNumber(e.target.value)}
                        placeholder="Enter employee number"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && searchEmployeeByNumber()}
                      />
                      <Button 
                        onClick={searchEmployeeByNumber} 
                        disabled={searchingEmployee}
                        variant="outline"
                      >
                        {searchingEmployee ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
                    {employeeSearchError && (
                      <p className="text-sm text-red-600">{employeeSearchError}</p>
                    )}
                  </div>
                  
                  {/* Employee Information Display */}
                  {foundEmployee && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <User className="w-5 h-5 mr-2 text-green-600" />
                          Employee Found
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                            <p className="text-base font-semibold">{foundEmployee.fullName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Employee Number</Label>
                            <p className="text-base">{foundEmployee.employeeNumber}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Email</Label>
                            <p className="text-base">{foundEmployee.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Phone</Label>
                            <p className="text-base">{foundEmployee.phoneNumber}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Department</Label>
                            <p className="text-base">{foundEmployee.departmentName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Position</Label>
                            <p className="text-base">{foundEmployee.positionTitle}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Employer Institution</Label>
                            <p className="text-base">{foundEmployee.employerInstitutionName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Employment Status</Label>
                            <Badge variant={foundEmployee.employmentStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                              {foundEmployee.employmentStatus}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              
              {/* Step 2: Membership Details */}
              {wizardStep === 2 && foundEmployee && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="memberNumber">Member Number</Label>
                    <Input
                      id="memberNumber"
                      value={memberForm.memberNumber}
                      onChange={(e) => setMemberForm({...memberForm, memberNumber: e.target.value})}
                      placeholder="Enter member number"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Membership Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !membershipDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {membershipDate ? format(membershipDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={membershipDate}
                          onSelect={(date) => date && setMembershipDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status">Membership Status</Label>
                    <Select 
                      value={memberForm.membershipStatus} 
                      onValueChange={(value) => setMemberForm({...memberForm, membershipStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="shareBalance">Initial Share Balance</Label>
                    <Input
                      id="shareBalance"
                      type="number"
                      value={memberForm.shareBalance}
                      onChange={(e) => setMemberForm({...memberForm, shareBalance: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  {/* Employee Summary */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Selected Employee</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {foundEmployee.fullName}</p>
                        <p><strong>Employee #:</strong> {foundEmployee.employeeNumber}</p>
                        <p><strong>Institution:</strong> {foundEmployee.employerInstitutionName}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  {wizardStep === 2 && (
                    <Button variant="outline" onClick={previousWizardStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  {wizardStep === 1 && foundEmployee && (
                    <Button onClick={nextWizardStep}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  {wizardStep === 2 && (
                    <Button onClick={handleCreateMember} disabled={creatingMember}>
                      {creatingMember ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        'Create Member'
                      )}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members List</CardTitle>
          <CardDescription>
            {filteredMembers.length} member(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading members...</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Number</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employer Institution</TableHead>
                    <TableHead>Membership Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Share Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.memberNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{member.employeeNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{member.employerInstitutionName}</TableCell>
                        <TableCell>{format(new Date(member.membershipDate), 'PPP')}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.membershipStatus)}>
                            {member.membershipStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>MWK {member.shareBalance.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(member)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update member information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editMemberNumber">Member Number</Label>
              <Input
                id="editMemberNumber"
                value={memberForm.memberNumber}
                onChange={(e) => setMemberForm({...memberForm, memberNumber: e.target.value})}
                placeholder="Enter member number"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Membership Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !membershipDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {membershipDate ? format(membershipDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={membershipDate}
                    onSelect={(date) => date && setMembershipDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editStatus">Membership Status</Label>
              <Select 
                value={memberForm.membershipStatus} 
                onValueChange={(value) => setMemberForm({...memberForm, membershipStatus: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editShareBalance">Share Balance</Label>
              <Input
                id="editShareBalance"
                type="number"
                value={memberForm.shareBalance}
                onChange={(e) => setMemberForm({...memberForm, shareBalance: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMember}>Update Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionMembers;
