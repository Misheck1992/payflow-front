import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { departmentService, Department, CreateDepartmentRequest } from '@/services/departmentService';

export const Departments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [isCreateDepartmentDialogOpen, setIsCreateDepartmentDialogOpen] = useState(false);
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [departmentFormData, setDepartmentFormData] = useState({
    department_code: '',
    department_name: '',
    description: '',
    location: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const departmentsData = await departmentService.getDepartments();

      // Ensure all departments have required fields with defaults
      const departmentsWithDefaults = departmentsData.map(dept => ({
        ...dept,
        employee_count: dept.employee_count || 0
      }));

      setDepartments(departmentsWithDefaults);
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
      department_code: '',
      department_name: '',
      description: '',
      location: ''
    });
  };

  const handleCreateDepartment = async () => {
    try {
      setIsCreatingDepartment(true);
      const newDepartment = await departmentService.createDepartment(departmentFormData);

      // Ensure the new department has all required fields with defaults
      const departmentWithDefaults = {
        ...newDepartment,
        employee_count: newDepartment.employee_count || 0
      };

      setDepartments(prev => [...prev, departmentWithDefaults]);
      setIsCreateDepartmentDialogOpen(false);
      resetDepartmentForm();
      toast({
        title: "Department Created",
        description: `${departmentFormData.department_name} has been successfully created.`
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage your institution's departments and organizational structure</p>
        </div>
        <Dialog open={isCreateDepartmentDialogOpen} onOpenChange={setIsCreateDepartmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to your institution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department-code">Department Code</Label>
                  <Input
                    id="department-code"
                    value={departmentFormData.department_code}
                    onChange={(e) => setDepartmentFormData({ ...departmentFormData, department_code: e.target.value })}
                    placeholder="e.g. HR, IT, FIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department-name">Department Name</Label>
                  <Input
                    id="department-name"
                    value={departmentFormData.department_name}
                    onChange={(e) => setDepartmentFormData({ ...departmentFormData, department_name: e.target.value })}
                    placeholder="Enter department name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department-description">Description</Label>
                <Input
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
                  placeholder="Office location"
                />
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
                  disabled={isCreatingDepartment || !departmentFormData.department_name.trim()}
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

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Main Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Sub-departments</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{departments.reduce((sum, dept) => {
                  const count = dept?.employee_count;
                  return sum + (typeof count === 'number' ? count : 0);
                }, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments List */}
      {departmentsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading departments...</span>
        </div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Departments</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any departments yet. Start by creating your first department.
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
                    <div className="p-3 rounded-lg bg-green-100">
                      <Building className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold">{department.department_name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {department.department_code}
                        </Badge>
                      </div>
                      {department.description && (
                        <p className="text-sm text-muted-foreground mb-2">{department.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{department.employee_count || 0} employees</span>
                        {department.location && <span>📍 {department.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Active</Badge>
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
    </div>
  );
};
