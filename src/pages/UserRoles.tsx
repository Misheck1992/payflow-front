import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  Users,
  Settings,
  Lock,
  Loader2,
  Key,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { roleManagementService, Role, CreateRoleRequest } from '@/services/roleManagementService';

export const UserRoles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isViewRoleDialogOpen, setIsViewRoleDialogOpen] = useState(false);

  const [roleFormData, setRoleFormData] = useState({
    role_name: '',
    role_code: '',
    description: '',
    permissions: {} as Record<string, string[]>
  });

  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const data = await roleManagementService.getInstitutionRoles();
      setRoles(data);
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
  }, [toast]);

  useEffect(() => {
    if (user?.institutionId) {
      loadRoles();
    }
  }, [user?.institutionId, loadRoles]);

  const resetRoleForm = () => {
    setRoleFormData({
      role_name: '',
      role_code: '',
      description: '',
      permissions: {}
    });
  };

  const handleCreateRole = async () => {
    if (!user?.institutionId) return;

    try {
      setIsCreatingRole(true);

      const createRequest: CreateRoleRequest = {
        role_name: roleFormData.role_name,
        role_code: roleFormData.role_code,
        description: roleFormData.description,
        institution_id: user.institutionId,
        permissions: roleFormData.permissions
      };

      const newRole = await roleManagementService.createCustomRole(createRequest);
      setRoles(prev => [...prev, newRole]);
      setIsCreateRoleDialogOpen(false);
      resetRoleForm();
      toast({
        title: "Role Created",
        description: `Role "${roleFormData.role_name}" has been successfully created.`
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

  const getSystemBadge = (isCustom: boolean) => {
    return !isCustom ? (
      <Badge className="bg-orange-100 text-orange-800">
        <Lock className="w-3 h-3 mr-1" />
        System
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Custom
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter roles based on search
  const filteredRoles = roles.filter(role => {
    return searchTerm === '' ||
      role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Roles</h1>
          <p className="text-muted-foreground mt-1">Manage roles and permissions for your institution</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific permissions for your institution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name *</Label>
                    <Input
                      id="roleName"
                      value={roleFormData.role_name}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, role_name: e.target.value }))}
                      placeholder="e.g., Loan Officer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleCode">Role Code *</Label>
                    <Input
                      id="roleCode"
                      value={roleFormData.role_code}
                      onChange={(e) => setRoleFormData(prev => ({ ...prev, role_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., LOAN_OFFICER"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={roleFormData.description}
                    onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the responsibilities and scope of this role..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permissions">Permissions (JSON Object)</Label>
                  <Textarea
                    id="permissions"
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
                    placeholder='{"users": ["create", "read", "update"], "reports": ["read"], "settings": ["read", "update"]}'
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define permissions as JSON object with module names as keys and arrays of permissions as values.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetRoleForm();
                    setIsCreateRoleDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={isCreatingRole || !roleFormData.role_name.trim() || !roleFormData.role_code.trim()}
                >
                  {isCreatingRole ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Role'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Lock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => !r.is_custom).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Custom Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => r.is_custom).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({filteredRoles.length})</CardTitle>
          <CardDescription>Manage user roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading roles...</span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No roles found</h4>
              <p className="text-muted-foreground mb-4">
                {searchTerm ?
                  'No roles match your search criteria.' :
                  'Start by creating your first role.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateRoleDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Role
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.role_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.role_code}</Badge>
                    </TableCell>
                    <TableCell>{getSystemBadge(role.is_custom)}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {role.description || 'No description provided'}
                      </p>
                    </TableCell>
                    <TableCell>{formatDate(role.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedRole(role);
                            setIsViewRoleDialogOpen(true);
                          }}>
                            <Settings className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={role.isSystemRole}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={role.isSystemRole}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
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

      {/* Role Details Dialog */}
      <Dialog open={isViewRoleDialogOpen} onOpenChange={setIsViewRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedRole?.roleName}
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role Name</Label>
                  <p className="text-sm">{selectedRole.roleName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role Code</Label>
                  <p className="text-sm">{selectedRole.roleCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <div className="mt-1">
                    {getSystemBadge(selectedRole.is_custom)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(selectedRole.createdAt)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedRole.description || 'No description provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Permissions</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <pre className="text-xs text-muted-foreground overflow-auto">
                    {selectedRole.permissions
                      ? JSON.stringify(JSON.parse(selectedRole.permissions), null, 2)
                      : 'No specific permissions defined'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setIsViewRoleDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};