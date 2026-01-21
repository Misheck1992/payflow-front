import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { systemConfigurationService, SystemSetting } from '@/services/systemConfigurationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Calendar,
  Globe,
  Bell,
  Shield,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  DollarSign,
  Database,
  Wifi,
  WifiOff,
  Plus,
  Edit,
  Trash2,
  Building,
  Eye,
  EyeOff
} from 'lucide-react';

export const SystemConfiguration = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);

  // Settings data
  const [globalSettings, setGlobalSettings] = useState<SystemSetting[]>([]);
  const [institutionSettings, setInstitutionSettings] = useState<SystemSetting[]>([]);
  const [settingsSummary, setSettingsSummary] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [newSetting, setNewSetting] = useState({
    institution_id: '',
    setting_key: '',
    setting_value: '',
    setting_type: 'string' as 'string' | 'number' | 'decimal' | 'boolean' | 'json',
    description: ''
  });

  // Quick settings for common configurations
  const [quickSettings, setQuickSettings] = useState({
    payment_cutoff_day: 20,
    maintenance_mode: false,
    max_deduction_amount: 500000,
    session_timeout_minutes: 30,
    max_file_size_mb: 50
  });

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setIsLoading(true);
      const response = await systemConfigurationService.getAllSystemSettings();

      setGlobalSettings(response.data.global_settings || []);
      setInstitutionSettings(response.data.institution_settings || []);
      setSettingsSummary(response.data.summary || null);

      // Update quick settings from loaded data
      const updatedQuickSettings = { ...quickSettings };
      response.data.global_settings?.forEach(setting => {
        switch (setting.key) {
          case 'payment_cutoff_day':
            updatedQuickSettings.payment_cutoff_day = parseInt(setting.value) || 20;
            break;
          case 'maintenance_mode':
            updatedQuickSettings.maintenance_mode = setting.value === 'true';
            break;
          case 'max_deduction_amount':
            updatedQuickSettings.max_deduction_amount = parseInt(setting.value) || 500000;
            break;
          case 'session_timeout_minutes':
            updatedQuickSettings.session_timeout_minutes = parseInt(setting.value) || 30;
            break;
          case 'max_file_size_mb':
            updatedQuickSettings.max_file_size_mb = parseInt(setting.value) || 50;
            break;
        }
      });
      setQuickSettings(updatedQuickSettings);

    } catch (error) {
      console.error('Error loading system settings:', error);
      toast({
        title: "Warning",
        description: "Could not load current settings. Using default values.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSetting = async () => {
    try {
      setIsSaving(true);
      await systemConfigurationService.createOrUpdateSetting({
        institution_id: newSetting.institution_id || undefined,
        setting_key: newSetting.setting_key,
        setting_value: newSetting.setting_value,
        setting_type: newSetting.setting_type,
        description: newSetting.description
      });

      toast({
        title: "Setting Created",
        description: `Setting "${newSetting.setting_key}" has been created successfully.`,
      });

      setShowCreateDialog(false);
      setNewSetting({
        institution_id: '',
        setting_key: '',
        setting_value: '',
        setting_type: 'string',
        description: ''
      });

      await loadAllSettings();
    } catch (error) {
      console.error('Error creating setting:', error);
      toast({
        title: "Error",
        description: "Failed to create setting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSetting = async () => {
    if (!selectedSetting) return;

    try {
      setIsSaving(true);
      await systemConfigurationService.createOrUpdateSetting({
        institution_id: selectedSetting.institution_id || undefined,
        setting_key: selectedSetting.key,
        setting_value: selectedSetting.value,
        setting_type: selectedSetting.type,
        description: selectedSetting.description
      });

      toast({
        title: "Setting Updated",
        description: `Setting "${selectedSetting.key}" has been updated successfully.`,
      });

      setShowEditDialog(false);
      setSelectedSetting(null);
      await loadAllSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSetting = async () => {
    if (!selectedSetting) return;

    try {
      setIsSaving(true);
      await systemConfigurationService.deleteSetting(selectedSetting.id);

      toast({
        title: "Setting Deleted",
        description: `Setting "${selectedSetting.key}" has been deleted successfully.`,
      });

      setShowDeleteDialog(false);
      setSelectedSetting(null);
      await loadAllSettings();
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast({
        title: "Error",
        description: "Failed to delete setting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSettingUpdate = async (key: string, value: any, type: 'string' | 'number' | 'decimal' | 'boolean' | 'json') => {
    try {
      setIsSaving(true);
      await systemConfigurationService.createOrUpdateSetting({
        setting_key: key,
        setting_value: value.toString(),
        setting_type: type,
        description: getSettingDescription(key)
      });

      toast({
        title: "Setting Updated",
        description: `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} has been updated.`,
      });

      await loadAllSettings();
    } catch (error) {
      console.error('Error updating quick setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      'payment_cutoff_day': 'Day of the month for payment processing cut-off (1-28)',
      'maintenance_mode': 'System maintenance mode status',
      'max_deduction_amount': 'Maximum allowed deduction amount',
      'session_timeout_minutes': 'User session timeout in minutes',
      'max_file_size_mb': 'Maximum file upload size in megabytes'
    };
    return descriptions[key] || 'System configuration setting';
  };

  const handleTestConnectivity = async () => {
    try {
      setIsTestingConnectivity(true);
      const response = await systemConfigurationService.testSystemConnectivity();
      setSystemHealth(response);
      
      toast({
        title: "Connectivity Test Complete",
        description: "System connectivity test completed successfully.",
      });
    } catch (error) {
      console.error('Error testing connectivity:', error);
      setSystemHealth({ status: 'error', message: 'Connectivity test failed' });
      toast({
        title: "Connectivity Test Failed",
        description: "System connectivity test failed. Please check system status.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-MW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          System Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences for the PayFlow platform
        </p>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <CardTitle>System Health</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={handleTestConnectivity}
              disabled={isTestingConnectivity}
              className="flex items-center gap-2"
            >
              {isTestingConnectivity ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Test Connectivity
                </>
              )}
            </Button>
          </div>
          <CardDescription>Monitor system status and connectivity</CardDescription>
        </CardHeader>
        <CardContent>
          {systemHealth ? (
            <div className="flex items-center gap-2">
              {systemHealth.status === 'error' ? (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <Badge variant="destructive">System Issues Detected</Badge>
                </>
              ) : (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <Badge className="bg-green-100 text-green-800">System Healthy</Badge>
                </>
              )}
              <span className="text-sm text-muted-foreground ml-2">
                Last checked: {formatDate(new Date().toISOString())}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Click "Test Connectivity" to check system health</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {settingsSummary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Settings</p>
                  <p className="text-2xl font-bold">{settingsSummary.total_settings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Global Settings</p>
                  <p className="text-2xl font-bold">{settingsSummary.global_settings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Institution Settings</p>
                  <p className="text-2xl font-bold">{settingsSummary.institution_settings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <CardTitle>Quick Settings</CardTitle>
            </div>
          </div>
          <CardDescription>Commonly used system configuration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_cutoff">Payment Cutoff Day</Label>
                <Select
                  value={quickSettings.payment_cutoff_day.toString()}
                  onValueChange={(value) => {
                    const day = parseInt(value);
                    setQuickSettings(prev => ({ ...prev, payment_cutoff_day: day }));
                    handleQuickSettingUpdate('payment_cutoff_day', day, 'number');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cutoff day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_deduction">Max Deduction Amount (MWK)</Label>
                <Input
                  id="max_deduction"
                  type="number"
                  value={quickSettings.max_deduction_amount}
                  onChange={(e) => {
                    const amount = parseInt(e.target.value) || 0;
                    setQuickSettings(prev => ({ ...prev, max_deduction_amount: amount }));
                  }}
                  onBlur={() => handleQuickSettingUpdate('max_deduction_amount', quickSettings.max_deduction_amount, 'number')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session_timeout">Session Timeout (Minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={quickSettings.session_timeout_minutes}
                  onChange={(e) => {
                    const timeout = parseInt(e.target.value) || 30;
                    setQuickSettings(prev => ({ ...prev, session_timeout_minutes: timeout }));
                  }}
                  onBlur={() => handleQuickSettingUpdate('session_timeout_minutes', quickSettings.session_timeout_minutes, 'number')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_file_size">Max File Size (MB)</Label>
                <Input
                  id="max_file_size"
                  type="number"
                  min="1"
                  max="500"
                  value={quickSettings.max_file_size_mb}
                  onChange={(e) => {
                    const size = parseInt(e.target.value) || 50;
                    setQuickSettings(prev => ({ ...prev, max_file_size_mb: size }));
                  }}
                  onBlur={() => handleQuickSettingUpdate('max_file_size_mb', quickSettings.max_file_size_mb, 'number')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance_mode"
                checked={quickSettings.maintenance_mode}
                onCheckedChange={(checked) => {
                  setQuickSettings(prev => ({ ...prev, maintenance_mode: checked }));
                  handleQuickSettingUpdate('maintenance_mode', checked, 'boolean');
                }}
              />
              <Label htmlFor="maintenance_mode" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Maintenance Mode
              </Label>
            </div>
            {quickSettings.maintenance_mode && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Maintenance mode is enabled. Users will see a maintenance message and won't be able to access the system.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Global Settings</CardTitle>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Setting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Setting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="setting_key">Setting Key</Label>
                    <Input
                      id="setting_key"
                      value={newSetting.setting_key}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, setting_key: e.target.value }))}
                      placeholder="e.g., timezone, currency"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setting_value">Setting Value</Label>
                    <Input
                      id="setting_value"
                      value={newSetting.setting_value}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, setting_value: e.target.value }))}
                      placeholder="Setting value"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setting_type">Setting Type</Label>
                    <Select
                      value={newSetting.setting_type}
                      onValueChange={(value: any) => setNewSetting(prev => ({ ...prev, setting_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="decimal">Decimal</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSetting.description}
                      onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Setting description"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateSetting}
                      disabled={isSaving || !newSetting.setting_key || !newSetting.setting_value}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Setting'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>System-wide configuration settings that apply to all institutions</CardDescription>
        </CardHeader>
        <CardContent>
          {globalSettings.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No global settings configured</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {globalSettings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.key}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {setting.is_encrypted ? (
                            <>
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">***encrypted***</span>
                            </>
                          ) : (
                            <span className="max-w-[200px] truncate">{setting.value}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{setting.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{setting.description}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(setting.updated_at)}</p>
                          <p className="text-muted-foreground">{setting.updated_by}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSetting(setting);
                              setShowEditDialog(true);
                            }}
                            title="Edit Setting"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSetting(setting);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete Setting"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Institution Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <CardTitle>Institution-Specific Settings</CardTitle>
          </div>
          <CardDescription>Settings that apply to specific institutions</CardDescription>
        </CardHeader>
        <CardContent>
          {institutionSettings.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No institution-specific settings configured</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutionSettings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.institution_name}</TableCell>
                      <TableCell>{setting.key}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {setting.is_encrypted ? (
                            <>
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">***encrypted***</span>
                            </>
                          ) : (
                            <span className="max-w-[200px] truncate">{setting.value}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{setting.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{setting.description}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(setting.updated_at)}</p>
                          <p className="text-muted-foreground">{setting.updated_by}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSetting(setting);
                              setShowEditDialog(true);
                            }}
                            title="Edit Setting"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSetting(setting);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete Setting"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Setting Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
          </DialogHeader>
          {selectedSetting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_setting_key">Setting Key</Label>
                <Input
                  id="edit_setting_key"
                  value={selectedSetting.key}
                  onChange={(e) => setSelectedSetting(prev => prev ? ({ ...prev, key: e.target.value }) : null)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_setting_value">Setting Value</Label>
                <Input
                  id="edit_setting_value"
                  value={selectedSetting.value}
                  onChange={(e) => setSelectedSetting(prev => prev ? ({ ...prev, value: e.target.value }) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_setting_type">Setting Type</Label>
                <Select
                  value={selectedSetting.type}
                  onValueChange={(value: any) => setSelectedSetting(prev => prev ? ({ ...prev, type: value }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="decimal">Decimal</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={selectedSetting.description}
                  onChange={(e) => setSelectedSetting(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSetting}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Setting'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Setting Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Setting</DialogTitle>
          </DialogHeader>
          {selectedSetting && (
            <div className="space-y-4">
              <p>Are you sure you want to delete the setting <strong>"{selectedSetting.key}"</strong>?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSetting}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Setting'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
