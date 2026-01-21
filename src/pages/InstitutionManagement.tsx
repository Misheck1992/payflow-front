import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building, Edit, Trash2, Eye, Users, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Institution } from '@/lib/mockData';
import { institutionService, transformToInstitution, InstitutionType, InstitutionStatus } from '@/services/institutionService';

export const InstitutionManagement = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [institutionTypes, setInstitutionTypes] = useState<InstitutionType[]>([]);
  const [institutionStatuses, setInstitutionStatuses] = useState<InstitutionStatus[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    institutionCode: '',
    name: '',
    type: 'EMPLOYER' as 'EMPLOYER' | 'SACCO' | 'FINANCIAL_INSTITUTION' | 'HYBRID' | 'HUB',
    registrationNumber: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PENDING'
  });

  // Load institutions on component mount
  useEffect(() => {
    loadInstitutions();
    loadFormOptions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setIsLoading(true);
      const response = await institutionService.getAllInstitutions();
      // Sort institutions by creation date (newest first)
      const transformedInstitutions = response
        .map(transformToInstitution)
        .sort((a, b) => {
          // Assuming we add a createdAt or updatedAt field to Institution interface
          // For now, we'll sort by id or name as a fallback
          return b.name.localeCompare(a.name);
        });
      setInstitutions(transformedInstitutions);
    } catch (error) {
      console.error('Error loading institutions:', error);
      toast({
        title: "Error",
        description: "Failed to load institutions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFormOptions = async () => {
    try {
      console.log('Loading form options...');
      const [typesResponse, statusesResponse] = await Promise.all([
        institutionService.getInstitutionTypes(),
        institutionService.getInstitutionStatuses()
      ]);
      console.log('Institution types received:', typesResponse);
      console.log('Institution statuses received:', statusesResponse);
      setInstitutionTypes(typesResponse);
      setInstitutionStatuses(statusesResponse);
    } catch (error) {
      console.error('Error loading form options:', error);
    }
  };

  // Filter institutions based on search and filters
  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = (institution.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (institution.institutionCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || institution.type === filterType;
    const matchesStatus = filterStatus === 'ALL' ||
                         (filterStatus === 'ACTIVE' && institution.isActive) ||
                         (filterStatus === 'INACTIVE' && !institution.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInstitutions = filteredInstitutions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  const resetForm = () => {
    setFormData({
      institutionCode: '',
      name: '',
      type: 'EMPLOYER',
      registrationNumber: '',
      address: '',
      contactEmail: '',
      contactPhone: '',
      status: 'ACTIVE'
    });
  };

  const handleCreateInstitution = async () => {
    try {
      setIsCreating(true);
      const createData = {
        institutionCode: formData.institutionCode,
        institutionName: formData.name,
        institutionType: formData.type,
        registrationNumber: formData.registrationNumber,
        physicalAddress: formData.address,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        status: formData.status
      };

      const response = await institutionService.createInstitution(createData);
      const newInstitution = transformToInstitution(response);
      
      setInstitutions(prev => [...prev, newInstitution]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Institution Created",
        description: `${formData.name} has been successfully created.`
      });
    } catch (error) {
      console.error('Error creating institution:', error);
      toast({
        title: "Error",
        description: "Failed to create institution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditInstitution = async () => {
    if (!selectedInstitution) return;

    try {
      setIsUpdating(true);
      const updateData = {
        institutionName: formData.name,
        physicalAddress: formData.address,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        status: formData.status
      };

      const response = await institutionService.updateInstitution(selectedInstitution.id, updateData);
      const updatedInstitution = transformToInstitution(response);
      
      setInstitutions(prev => prev.map(inst => 
        inst.id === selectedInstitution.id ? updatedInstitution : inst
      ));

      setIsEditDialogOpen(false);
      setSelectedInstitution(null);
      resetForm();
      toast({
        title: "Institution Updated",
        description: `${formData.name} has been successfully updated.`
      });
    } catch (error) {
      console.error('Error updating institution:', error);
      toast({
        title: "Error",
        description: "Failed to update institution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInstitution = async (institution: Institution) => {
    try {
      await institutionService.deleteInstitution(institution.id);
      setInstitutions(prev => prev.filter(inst => inst.id !== institution.id));
      toast({
        title: "Institution Deleted",
        description: `${institution.name} has been successfully deleted.`
      });
    } catch (error) {
      console.error('Error deleting institution:', error);
      toast({
        title: "Error",
        description: "Failed to delete institution. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (institution: Institution) => {
    setSelectedInstitution(institution);
    setFormData({
      institutionCode: institution.institutionCode,
      name: institution.name,
      type: institution.type,
      registrationNumber: institution.registrationNumber,
      address: institution.address,
      contactEmail: institution.contactEmail,
      contactPhone: institution.contactPhone,
      status: institution.isActive ? 'ACTIVE' : 'SUSPENDED'
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      EMPLOYER: 'bg-blue-100 text-blue-800',
      SACCO: 'bg-orange-100 text-orange-800',
      FINANCIAL_INSTITUTION: 'bg-purple-100 text-purple-800',
      HYBRID: 'bg-green-100 text-green-800',
      HUB: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Institution Management</h1>
          <p className="text-muted-foreground mt-1">Manage institutions and their accounts across the platform</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Institution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Institution</DialogTitle>
              <DialogDescription>
                Add a new institution to the PayFlow platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionCode">Institution Code</Label>
                  <Input
                    id="institutionCode"
                    placeholder="e.g. MOH"
                    value={formData.institutionCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, institutionCode: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.length > 0 ? (
                        institutionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))
                      ) : (
                        // Fallback options
                        <>
                          <SelectItem value="EMPLOYER">Employer</SelectItem>
                          <SelectItem value="SACCO">SACCO</SelectItem>
                          <SelectItem value="FINANCIAL_INSTITUTION">Financial Institution</SelectItem>
                          <SelectItem value="HUB">Hub</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  placeholder="Ministry of Health"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="REG-001-2024"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Physical address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="info@example.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+265-xxx-xxx"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionStatuses.length > 0 ? (
                      institutionStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback options
                      <>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInstitution} disabled={isCreating}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Institution
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {institutionTypes.length > 0 ? (
                    institutionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback options
                    <>
                      <SelectItem value="EMPLOYER">Employer</SelectItem>
                      <SelectItem value="SACCO">SACCO</SelectItem>
                      <SelectItem value="FINANCIAL_INSTITUTION">Financial Institution</SelectItem>
                      <SelectItem value="HUB">Hub</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {institutionStatuses.length > 0 ? (
                    institutionStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback options
                    <>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Institutions</p>
                <p className="text-2xl font-bold">{institutions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{institutions.filter(i => i.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Employers</p>
                <p className="text-2xl font-bold">{institutions.filter(i => i.type === 'EMPLOYER').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">SACCOs</p>
                <p className="text-2xl font-bold">{institutions.filter(i => i.type === 'SACCO').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Hubs</p>
                <p className="text-2xl font-bold">{institutions.filter(i => i.type === 'HUB').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institutions List */}
      <Card>
        <CardHeader>
          <CardTitle>Institutions ({filteredInstitutions.length})</CardTitle>
          <CardDescription>
            Manage and monitor all institutions in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2">Loading institutions...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedInstitutions.map((institution) => (
              <div key={institution.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                    <Building className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{institution.name}</h3>
                      {getTypeBadge(institution.type)}
                      {getStatusBadge(institution.isActive)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {institution.institutionCode} • {institution.registrationNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">{institution.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/institutions/${institution.id}`)}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(institution)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Institution</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {institution.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteInstitution(institution)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredInstitutions.length)} of {filteredInstitutions.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Institution</DialogTitle>
            <DialogDescription>
              Update institution information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editInstitutionCode">Institution Code</Label>
                <Input
                  id="editInstitutionCode"
                  value={formData.institutionCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, institutionCode: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionTypes.length > 0 ? (
                      institutionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback options
                      <>
                        <SelectItem value="EMPLOYER">Employer</SelectItem>
                        <SelectItem value="SACCO">SACCO</SelectItem>
                        <SelectItem value="FINANCIAL_INSTITUTION">Financial Institution</SelectItem>
                        <SelectItem value="HUB">Hub</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editName">Institution Name</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRegistrationNumber">Registration Number</Label>
              <Input
                id="editRegistrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Address</Label>
              <Input
                id="editAddress"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editContactEmail">Email</Label>
                <Input
                  id="editContactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContactPhone">Phone</Label>
                <Input
                  id="editContactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {institutionStatuses.length > 0 ? (
                    institutionStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback options
                    <>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditInstitution} disabled={isUpdating}>
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Institution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
