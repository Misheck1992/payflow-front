import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Users,
  FileText,
  Shield,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  MoreVertical,
  Eye,
  Loader2,
  ArrowRight,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Institution } from '@/lib/mockData';
import { institutionService, transformToInstitution, InstitutionRole, CreateRoleRequest, CreateUserRequest, InstitutionUser, InstitutionDepartment, CreateDepartmentRequest } from '@/services/institutionService';

// Mock data for demonstration - will be replaced with API calls
const mockDocuments = [
  {
    id: '1',
    name: 'Registration Certificate',
    type: 'PDF',
    size: '2.5 MB',
    uploadedBy: 'Admin User',
    uploadedAt: '2024-01-15T10:30:00Z',
    category: 'Legal'
  },
  {
    id: '2',
    name: 'Tax Certificate',
    type: 'PDF',
    size: '1.8 MB',
    uploadedBy: 'HR Manager',
    uploadedAt: '2024-01-10T14:20:00Z',
    category: 'Legal'
  },
  {
    id: '3',
    name: 'Bank Statement',
    type: 'PDF',
    size: '3.2 MB',
    uploadedBy: 'Finance Officer',
    uploadedAt: '2024-01-20T09:15:00Z',
    category: 'Financial'
  }
];

export const InstitutionView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [roles, setRoles] = useState<InstitutionRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    role_name: '',
    role_code: '',
    description: '',
    permissions: {} as Record<string, string[]>
  });
  const [users, setUsers] = useState<InstitutionUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    password: '',
    roleId: '',
    isSuperAdmin: false
  });
  const [departments, setDepartments] = useState<InstitutionDepartment[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [isCreateDepartmentDialogOpen, setIsCreateDepartmentDialogOpen] = useState(false);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [departmentFormData, setDepartmentFormData] = useState({
    departmentCode: '',
    departmentName: '',
    description: '',
    parentDepartmentId: '',
    location: '',
    costCenter: ''
  });
  const [selectedUser, setSelectedUser] = useState<InstitutionUser | null>(null);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isPasswordDisplayDialogOpen, setIsPasswordDisplayDialogOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<{new_password: string; message: string} | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadInstitution(id);
    }
  }, [id]);

  // Load roles when roles tab is accessed
  useEffect(() => {
    if (activeTab === 'roles' && id && roles.length === 0) {
      loadRoles(id);
    }
  }, [activeTab, id]);

  // Load users when users tab is accessed
  useEffect(() => {
    if (activeTab === 'users' && id && users.length === 0) {
      loadUsers(id);
    }
  }, [activeTab, id]);

  // Load departments when departments tab is accessed
  useEffect(() => {
    if (activeTab === 'departments' && id && departments.length === 0) {
      loadDepartments(id);
    }
  }, [activeTab, id]);

  const loadUsers = async (institutionId: string) => {
    try {
      setUsersLoading(true);
      const usersData = await institutionService.getInstitutionUsers(institutionId);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const loadRoles = async (institutionId: string) => {
    try {
      setRolesLoading(true);
      const rolesData = await institutionService.getInstitutionRoles(institutionId);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({
        title: "Error",
        description: "Failed to load roles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const resetRoleForm = () => {
    setRoleFormData({
      role_name: '',
      role_code: '',
      description: '',
      permissions: {}
    });
  };

  const handleCreateRole = async () => {
    if (!id) return;

    try {
      setIsCreatingRole(true);
      const newRole = await institutionService.createRole(id, roleFormData);
      setRoles(prev => [...prev, newRole]);
      setIsCreateRoleDialogOpen(false);
      resetRoleForm();
      toast({
        title: "Role Created",
        description: `${roleFormData.role_name} has been successfully created.`
      });
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingRole(false);
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      middleName: '',
      password: '',
      roleId: '',
      isSuperAdmin: false
    });
  };

  const handleCreateUser = async () => {
    if (!id) return;

    try {
      setIsCreatingUser(true);
      const newUser = await institutionService.createUser(id, userFormData);
      setUsers(prev => [...prev, newUser]);
      setIsCreateUserDialogOpen(false);
      resetUserForm();
      toast({
        title: "User Created",
        description: `${userFormData.firstName} ${userFormData.lastName} has been successfully created.`
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleResetPassword = async () => {
    if (!id || !selectedUser) return;

    try {
      setIsResettingPassword(true);
      const result = await institutionService.resetUserPassword(id, selectedUser.id);
      setIsResetPasswordDialogOpen(false);
      setTemporaryPassword(result);
      setIsPasswordDisplayDialogOpen(true);
      setPasswordCopied(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setPasswordCopied(true);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard"
      });
      setTimeout(() => setPasswordCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password to clipboard",
        variant: "destructive"
      });
    }
  };

  const loadDepartments = async (institutionId: string) => {
    try {
      setDepartmentsLoading(true);
      const departmentsData = await institutionService.getInstitutionDepartments(institutionId);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentFormData({
      departmentCode: '',
      departmentName: '',
      description: '',
      parentDepartmentId: '',
      location: '',
      costCenter: ''
    });
  };

  const handleCreateDepartment = async () => {
    if (!id) return;

    try {
      setIsCreatingDepartment(true);
      const departmentData = {
        ...departmentFormData,
        parentDepartmentId: departmentFormData.parentDepartmentId || null
      };
      const newDepartment = await institutionService.createDepartment(id, departmentData);
      setDepartments(prev => [...prev, newDepartment]);
      setIsCreateDepartmentDialogOpen(false);
      resetDepartmentForm();
      toast({
        title: "Department Created",
        description: `${departmentFormData.departmentName} has been successfully created.`
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "Error",
        description: "Failed to create department. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  const loadInstitution = async (institutionId: string) => {
    try {
      setLoading(true);
      const response = await institutionService.getInstitutionById(institutionId);
      const transformedInstitution = transformToInstitution(response);
      setInstitution(transformedInstitution);
    } catch (error) {
      console.error('Error loading institution:', error);
      toast({
        title: "Error",
        description: "Failed to load institution details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      TERMINATED: 'bg-red-100 text-red-800',
      PENDING: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      EMPLOYER: 'bg-blue-100 text-blue-800',
      SACCO: 'bg-orange-100 text-orange-800',
      FINANCIAL_INSTITUTION: 'bg-purple-100 text-purple-800',
      HYBRID: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading institution details...</p>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Institution Not Found</h2>
          <p className="text-muted-foreground mb-4">The institution you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/institutions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/institutions')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{institution.name}</h1>
            <p className="text-muted-foreground mt-1">Institution Code: {institution.institutionCode}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getTypeBadge(institution.type)}
          {getStatusBadge(institution.isActive ? 'ACTIVE' : 'SUSPENDED')}
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Institution Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{mockDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => !u.lockedUntil).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Institution Details</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Institution Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core institution details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Institution Code</label>
                    <p className="font-medium">{institution.institutionCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="mt-1">{getTypeBadge(institution.type)}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution Name</label>
                  <p className="font-medium">{institution.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                  <p className="font-medium">{institution.registrationNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(institution.isActive ? 'ACTIVE' : 'SUSPENDED')}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Contact details and location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{institution.contactEmail || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{institution.contactPhone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="font-medium">{institution.address || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Departments</h3>
              <p className="text-muted-foreground">Manage institution departments and organizational structure</p>
            </div>
            <Dialog open={isCreateDepartmentDialogOpen} onOpenChange={setIsCreateDepartmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="department-code">Department Code</Label>
                    <Input
                      id="department-code"
                      value={departmentFormData.departmentCode}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, departmentCode: e.target.value })}
                      placeholder="e.g. HR, IT, FIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department-name">Department Name</Label>
                    <Input
                      id="department-name"
                      value={departmentFormData.departmentName}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, departmentName: e.target.value })}
                      placeholder="Enter department name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department-description">Description</Label>
                    <Textarea
                      id="department-description"
                      value={departmentFormData.description}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                      placeholder="Enter department description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={departmentFormData.location}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, location: e.target.value })}
                      placeholder="e.g. Main Building - 2nd Floor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost-center">Cost Center</Label>
                    <Input
                      id="cost-center"
                      value={departmentFormData.costCenter}
                      onChange={(e) => setDepartmentFormData({ ...departmentFormData, costCenter: e.target.value })}
                      placeholder="e.g. CC-HR-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent-department">Parent Department (Optional)</Label>
                    <Select
                      value={departmentFormData.parentDepartmentId || undefined}
                      onValueChange={(value) => setDepartmentFormData({ ...departmentFormData, parentDepartmentId: value || '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetDepartmentForm();
                        setIsCreateDepartmentDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateDepartment}
                      disabled={isCreatingDepartment || !departmentFormData.departmentName.trim() || !departmentFormData.departmentCode.trim() || !departmentFormData.location.trim() || !departmentFormData.costCenter.trim()}
                    >
                      {isCreatingDepartment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Department'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {departmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading departments...</span>
            </div>
          ) : departments.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No Departments</h4>
                  <p className="text-muted-foreground mb-4">
                    This institution doesn't have any departments yet.
                  </p>
                  <Button onClick={() => setIsCreateDepartmentDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Department
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {departments.map((department) => (
                <Card key={department.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${department.parentDepartmentId ? 'bg-blue-100' : 'bg-green-100'}`}>
                          <Building className={`w-5 h-5 ${department.parentDepartmentId ? 'text-blue-600' : 'text-green-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{department.departmentName}</h4>
                          {department.description && (
                            <p className="text-sm text-muted-foreground">{department.description}</p>
                          )}
                          {department.parentDepartmentId && (
                            <div className="flex items-center mt-1">
                              <ArrowRight className="w-3 h-3 text-muted-foreground mr-1" />
                              <span className="text-xs text-muted-foreground">
                                Sub-department of {departments.find(d => d.id === department.parentDepartmentId)?.departmentName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">
                          Active
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Department
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Department
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Documents</h3>
              <p className="text-muted-foreground">Manage institution documents and files</p>
            </div>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.category}</Badge>
                      </TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Roles & Permissions</h3>
              <p className="text-muted-foreground">Manage user roles and their permissions</p>
            </div>
            <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Add a new role for this institution
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      placeholder="e.g. HR Manager"
                      value={roleFormData.role_name}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, role_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleCode">Role Code</Label>
                    <Input
                      id="roleCode"
                      placeholder="e.g. EMPLOYER_ADMIN"
                      value={roleFormData.role_code}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, role_code: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role responsibilities"
                      value={roleFormData.description}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permissions">Permissions (JSON Object)</Label>
                    <Textarea
                      id="permissions"
                      placeholder='{"users": ["create", "read", "update"], "reports": ["read"], "settings": ["read", "update"]}'
                      value={JSON.stringify(roleFormData.permissions, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                            setRoleFormData(prev => ({ ...prev, permissions: parsed }));
                          }
                        } catch (error) {
                          // Keep the current value if JSON is invalid
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRole} disabled={isCreatingRole}>
                      {isCreatingRole && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Role
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolesLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading roles...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No roles found</h3>
                <p className="text-sm text-muted-foreground">
                  No roles have been created for this institution yet.
                </p>
              </div>
            ) : (
              roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.role_name}</CardTitle>
                      <Badge variant={!role.is_custom ? "default" : "secondary"}>
                        {!role.is_custom ? "System" : "Custom"}
                      </Badge>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Role Code</label>
                      <Badge variant="outline" className="text-xs">
                        {role.role_code}
                      </Badge>
                    </div>
                    <div className="space-y-2 mt-3">
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(role.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm" disabled={role.isSystemRole}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Users</h3>
              <p className="text-muted-foreground">Manage institution users and their access</p>
            </div>
            <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to this institution
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={userFormData.firstName}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={userFormData.lastName}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name (Optional)</Label>
                    <Input
                      id="middleName"
                      placeholder="Michael"
                      value={userFormData.middleName}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, middleName: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@company.com"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+265884642594"
                        value={userFormData.phoneNumber}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleId">Role</Label>
                    <Select value={userFormData.roleId} onValueChange={(value) => setUserFormData(prev => ({ ...prev, roleId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSuperAdmin"
                      checked={userFormData.isSuperAdmin}
                      onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, isSuperAdmin: !!checked }))}
                    />
                    <Label htmlFor="isSuperAdmin">Super Admin</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} disabled={isCreatingUser}>
                      {isCreatingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="ml-2">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">No users found</h3>
                          <p className="text-sm text-muted-foreground">
                            No users have been added to this institution yet.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {((user.firstName || user.first_name) || 'U')[0]}{((user.lastName || user.last_name) || 'U')[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.roleName}</Badge>
                          {user.isSuperAdmin && (
                            <Badge className="ml-2 bg-red-100 text-red-800">Super Admin</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={user.lockedUntil ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            {user.lockedUntil ? 'Locked' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsUserDetailsDialogOpen(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsResetPasswordDialogOpen(true);
                                  }}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsDialogOpen} onOpenChange={setIsUserDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {((selectedUser.firstName || selectedUser.first_name) || 'U')[0]}{((selectedUser.lastName || selectedUser.last_name) || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedUser.fullName}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedUser.roleName}</Badge>
                    {selectedUser.isSuperAdmin && (
                      <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
                    )}
                    <Badge className={selectedUser.lockedUntil ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                      {selectedUser.lockedUntil ? 'Locked' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Username</label>
                      <p className="font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="font-medium">{selectedUser.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="font-medium">{selectedUser.firstName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="font-medium">{selectedUser.lastName || 'Not provided'}</p>
                    </div>
                    {selectedUser.middle_name && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Middle Name</label>
                        <p className="font-medium">{selectedUser.middle_name}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    {selectedUser.phone_number && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                          <p className="font-medium">{selectedUser.phone_number}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Role & Permissions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role & Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <div className="mt-1">
                        <Badge variant="outline">{selectedUser.roleName}</Badge>
                      </div>
                    </div>
                    {selectedUser.role_code && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Role Code</label>
                        <p className="font-medium">{selectedUser.role_code}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Super Admin</label>
                      <p className="font-medium">{selectedUser.isSuperAdmin ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge className={selectedUser.lockedUntil ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                          {selectedUser.lockedUntil ? 'Locked' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                      <p className="font-medium">
                        {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Password Changed</label>
                      <p className="font-medium">
                        {selectedUser.password_changed_at ? new Date(selectedUser.password_changed_at).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Failed Login Attempts</label>
                      <p className="font-medium">{selectedUser.failed_login_attempts || 0}</p>
                    </div>
                    {selectedUser.lockedUntil && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Locked Until</label>
                        <p className="font-medium text-red-600">
                          {new Date(selectedUser.lockedUntil).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="font-medium">
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="font-medium">
                        {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Permissions */}
              {selectedUser.permissions && Object.keys(selectedUser.permissions).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(selectedUser.permissions).map(([module, permissions]) => (
                        <div key={module} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm capitalize mb-2">{module}</h4>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(permissions) ? permissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            )) : (
                              <Badge variant="secondary" className="text-xs">
                                {String(permissions)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsUserDetailsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Handle edit functionality
                    setIsUserDetailsDialogOpen(false);
                    // You can add edit functionality here
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Reset User Password
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {((selectedUser.firstName || selectedUser.first_name) || 'U')[0]}{((selectedUser.lastName || selectedUser.last_name) || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedUser.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">What will happen:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• A new temporary password will be generated</li>
                  <li>• The user will need to change their password on next login</li>
                  <li>• The user will be notified of the password reset</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This action will immediately invalidate the user's current password.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResetPasswordDialogOpen(false);
                    setSelectedUser(null);
                  }}
                  disabled={isResettingPassword}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isResettingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Display Dialog */}
      <Dialog open={isPasswordDisplayDialogOpen} onOpenChange={setIsPasswordDisplayDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Password Reset Successful
            </DialogTitle>
          </DialogHeader>
          {selectedUser && temporaryPassword && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {((selectedUser.firstName || selectedUser.first_name) || 'U')[0]}{((selectedUser.lastName || selectedUser.last_name) || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedUser.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Password Reset Complete</h3>
                <p className="text-sm text-muted-foreground">
                  A new temporary password has been generated for this user.
                </p>
              </div>

              {/* Temporary Password */}
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Temporary Password
                  </label>
                  <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                    <code className="font-mono text-lg font-semibold text-gray-800 select-all">
                      {temporaryPassword.new_password}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(temporaryPassword.new_password)}
                      className="ml-3"
                    >
                      {passwordCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* API Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> {temporaryPassword.message}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-medium">Next Steps:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    Share this temporary password securely with the user
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    User must change their password upon next login
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    This temporary password expires after first use
                  </li>
                </ul>
              </div>

              {/* Security Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Security Note:</strong> Do not share this password over unsecured channels.
                  Consider using secure communication methods like encrypted messaging or phone calls.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(temporaryPassword.new_password)}
                  className="flex-1 mr-2"
                >
                  {passwordCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Password
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsPasswordDisplayDialogOpen(false);
                    setSelectedUser(null);
                    setTemporaryPassword(null);
                    setPasswordCopied(false);
                  }}
                  className="flex-1 ml-2"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
