import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Loader2,
  DollarSign,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { positionService, Position } from '@/services/positionService';
import { departmentService, Department } from '@/services/departmentService';

export const EmployeePositions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [isCreatePositionDialogOpen, setIsCreatePositionDialogOpen] = useState(false);
  const [isCreatingPosition, setIsCreatingPosition] = useState(false);
  const [positionFormData, setPositionFormData] = useState({
    position_code: '',
    position_title: '',
    department_id: '',
    salary_grade: '',
    min_salary: '',
    max_salary: ''
  });

  useEffect(() => {
    loadPositions();
    loadDepartments();
  }, []);

  const loadPositions = async () => {
    try {
      setPositionsLoading(true);
      const data = await positionService.getPositions();

      // Ensure all positions have required fields with defaults
      const positionsWithDefaults = data.map(position => ({
        ...position,
        employee_count: position.employee_count || 0
      }));

      setPositions(positionsWithDefaults);
    } catch (error) {
      console.error('Error loading positions:', error);
      toast({
        title: "Error",
        description: "Failed to load positions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPositionsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const data = await departmentService.getDepartments();
      setDepartments(data);
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

  const resetPositionForm = () => {
    setPositionFormData({
      position_code: '',
      position_title: '',
      department_id: '',
      salary_grade: '',
      min_salary: '',
      max_salary: ''
    });
  };

  const handleCreatePosition = async () => {
    try {
      setIsCreatingPosition(true);
      const newPosition = await positionService.createPosition({
        ...positionFormData,
        min_salary: parseFloat(positionFormData.min_salary),
        max_salary: parseFloat(positionFormData.max_salary)
      });

      // Ensure the new position has all required fields with defaults
      const positionWithDefaults = {
        ...newPosition,
        employee_count: newPosition.employee_count || 0
      };

      setPositions(prev => [...prev, positionWithDefaults]);
      setIsCreatePositionDialogOpen(false);
      resetPositionForm();
      toast({
        title: "Position Created",
        description: `${positionFormData.position_title} has been successfully created.`
      });
    } catch (error) {
      console.error('Error creating position:', error);
      toast({
        title: "Error",
        description: "Failed to create position. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPosition(false);
    }
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Positions</h1>
          <p className="text-muted-foreground mt-1">Manage job positions and organizational structure</p>
        </div>
        <Dialog open={isCreatePositionDialogOpen} onOpenChange={setIsCreatePositionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Position</DialogTitle>
              <DialogDescription>
                Add a new job position to your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position-code">Position Code</Label>
                  <Input
                    id="position-code"
                    value={positionFormData.position_code}
                    onChange={(e) => setPositionFormData({ ...positionFormData, position_code: e.target.value })}
                    placeholder="e.g. HR-MGR-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position-title">Position Title</Label>
                  <Input
                    id="position-title"
                    value={positionFormData.position_title}
                    onChange={(e) => setPositionFormData({ ...positionFormData, position_title: e.target.value })}
                    placeholder="e.g. HR Manager"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={positionFormData.department_id}
                    onValueChange={(value) => setPositionFormData({ ...positionFormData, department_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-grade">Salary Grade</Label>
                  <Input
                    id="salary-grade"
                    value={positionFormData.salary_grade}
                    onChange={(e) => setPositionFormData({ ...positionFormData, salary_grade: e.target.value })}
                    placeholder="e.g. M1, S3, J2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-salary">Minimum Salary (MWK)</Label>
                  <Input
                    id="min-salary"
                    type="number"
                    value={positionFormData.min_salary}
                    onChange={(e) => setPositionFormData({ ...positionFormData, min_salary: e.target.value })}
                    placeholder="800000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-salary">Maximum Salary (MWK)</Label>
                  <Input
                    id="max-salary"
                    type="number"
                    value={positionFormData.max_salary}
                    onChange={(e) => setPositionFormData({ ...positionFormData, max_salary: e.target.value })}
                    placeholder="1200000"
                  />
                </div>
              </div>


              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetPositionForm();
                    setIsCreatePositionDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePosition}
                  disabled={isCreatingPosition || !positionFormData.position_title.trim() || !positionFormData.position_code.trim() || !positionFormData.department_id}
                >
                  {isCreatingPosition ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Position'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Positions Grid */}
      {positionsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading positions...</span>
        </div>
      ) : positions.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Positions</h4>
              <p className="text-muted-foreground mb-4">
                No job positions have been created yet.
              </p>
              <Button onClick={() => setIsCreatePositionDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Position
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {positions.map((position) => (
            <Card key={position.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{position.position_title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building2 className="w-3 h-3 mr-1" />
                        {position.department?.department_name || 'No Department'}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Position
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Position
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{position.position_code}</Badge>
                  <Badge variant="secondary">{position.salary_grade}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>
                      {formatCurrency(position.min_salary)} - {formatCurrency(position.max_salary)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{position.employee_count || 0} employee(s)</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created: {formatDate(position.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
