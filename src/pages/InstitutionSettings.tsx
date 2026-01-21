import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Calendar,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService, InstitutionDetailsResponse } from '@/services/institutionService';

export const InstitutionSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [institutionDetails, setInstitutionDetails] = useState<InstitutionDetailsResponse | null>(null);

  const [payrollSettings, setPayrollSettings] = useState({
    payrollFrequency: 'MONTHLY',
    payDay: '25',
    taxRate: '30',
    pensionRate: '5',
    autoCalculateTax: true,
    autoCalculatePension: true,
    bankIntegrationEnabled: false
  });

  const [systemSettings, setSystemSettings] = useState({
    timezone: 'Africa/Blantyre',
    currency: 'MWK',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: 'MEDIUM',
    sessionTimeout: '30',
    loginAttempts: '5',
    apiKey: 'pk_live_***************1234',
    webhookUrl: ''
  });

  useEffect(() => {
    if (user?.institutionId) {
      loadInstitutionDetails(user.institutionId);
    }
  }, [user?.institutionId]);

  const loadInstitutionDetails = async (institutionId: string) => {
    try {
      setIsLoading(true);
      const details = await institutionService.getInstitutionDetails(institutionId);
      setInstitutionDetails(details);
    } catch (error) {
      console.error('Error loading institution details:', error);
      toast({
        title: "Error",
        description: "Failed to load institution details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInstitutionTypeBadge = (type: string | null) => {
    if (!type) return <Badge variant="outline">Not specified</Badge>;
    
    const variants: Record<string, string> = {
      EMPLOYER: 'bg-blue-100 text-blue-800',
      SACCO: 'bg-green-100 text-green-800',
      FINANCIAL_INSTITUTION: 'bg-purple-100 text-purple-800',
      HYBRID: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Not specified</Badge>;
    
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

  // Institution details are read-only, loaded from API

  const handleSavePayroll = async () => {
    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Payroll Settings Saved",
        description: "Payroll configuration has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payroll settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "System Settings Saved",
        description: "System configuration has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save system settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Security Settings Saved",
        description: "Security configuration has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Institution Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your institution's settings and preferences</p>
        </div>
      </div>

      {/* Institution Information - Read Only */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <CardTitle>Institution Information</CardTitle>
          </div>
          <CardDescription>Basic information about your institution (read-only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading institution details...</span>
            </div>
          ) : institutionDetails ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Institution Name</Label>
                    <p className="text-sm font-medium">{institutionDetails.institutionName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Institution Code</Label>
                    <p className="text-sm">{institutionDetails.institutionCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Institution Type</Label>
                    <div className="mt-1">
                      {getInstitutionTypeBadge(institutionDetails.institutionType)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(institutionDetails.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                    <p className="text-sm">{institutionDetails.registrationNumber}</p>
                  </div>
                  {institutionDetails.taxNumber && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tax Number</Label>
                      <p className="text-sm">{institutionDetails.taxNumber}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Email</Label>
                    <p className="text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {institutionDetails.contactEmail}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Phone</Label>
                    <p className="text-sm flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {institutionDetails.contactPhone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Physical Address</Label>
                    <p className="text-sm flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {institutionDetails.physicalAddress}
                    </p>
                  </div>
                  {institutionDetails.postalAddress && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Postal Address</Label>
                      <p className="text-sm">{institutionDetails.postalAddress}</p>
                    </div>
                  )}
                  {institutionDetails.website && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                      <p className="text-sm flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        <a href={institutionDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {institutionDetails.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Institution Statistics */}
              <div>
                <h4 className="font-semibold text-lg border-b pb-2 mb-4">Institution Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{institutionDetails.totalEmployees}</p>
                    <p className="text-sm text-blue-700">Total Employees</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">{institutionDetails.activeEmployees}</p>
                    <p className="text-sm text-green-700">Active Employees</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Settings className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{institutionDetails.totalDeductionRequests}</p>
                    <p className="text-sm text-purple-700">Total Requests</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{institutionDetails.pendingDeductionRequests}</p>
                    <p className="text-sm text-orange-700">Pending Requests</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Institution Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(institutionDetails.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(institutionDetails.updatedAt)}
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Institution information is managed by system administrators. Contact support if you need to update any of these details.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Failed to load institution details</h4>
              <p className="text-muted-foreground mb-4">Unable to fetch institution information.</p>
              <Button onClick={() => user?.institutionId && loadInstitutionDetails(user.institutionId)}>
                <Settings className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <CardTitle>Payroll Settings</CardTitle>
          </div>
          <CardDescription>Configure payroll processing settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payrollFrequency">Payroll Frequency</Label>
              <Select value={payrollSettings.payrollFrequency} onValueChange={(value) => setPayrollSettings(prev => ({ ...prev, payrollFrequency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payDay">Pay Day (Day of Month)</Label>
              <Input
                id="payDay"
                type="number"
                min="1"
                max="31"
                value={payrollSettings.payDay}
                onChange={(e) => setPayrollSettings(prev => ({ ...prev, payDay: e.target.value }))}
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                value={payrollSettings.taxRate}
                onChange={(e) => setPayrollSettings(prev => ({ ...prev, taxRate: e.target.value }))}
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pensionRate">Default Pension Rate (%)</Label>
              <Input
                id="pensionRate"
                type="number"
                min="0"
                max="100"
                value={payrollSettings.pensionRate}
                onChange={(e) => setPayrollSettings(prev => ({ ...prev, pensionRate: e.target.value }))}
                placeholder="5"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoCalculateTax"
                checked={payrollSettings.autoCalculateTax}
                onCheckedChange={(checked) => setPayrollSettings(prev => ({ ...prev, autoCalculateTax: checked }))}
              />
              <Label htmlFor="autoCalculateTax">Auto-calculate tax deductions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoCalculatePension"
                checked={payrollSettings.autoCalculatePension}
                onCheckedChange={(checked) => setPayrollSettings(prev => ({ ...prev, autoCalculatePension: checked }))}
              />
              <Label htmlFor="autoCalculatePension">Auto-calculate pension contributions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="bankIntegration"
                checked={payrollSettings.bankIntegrationEnabled}
                onCheckedChange={(checked) => setPayrollSettings(prev => ({ ...prev, bankIntegrationEnabled: checked }))}
              />
              <Label htmlFor="bankIntegration">Enable bank integration</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePayroll} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Payroll Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <CardTitle>System Settings</CardTitle>
          </div>
          <CardDescription>Configure system preferences and localization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Blantyre">Africa/Blantyre (CAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MWK">Malawian Kwacha (MWK)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ny">Chichewa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="twoFactorAuth"
                checked={systemSettings.twoFactorAuth}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
              />
              <Label htmlFor="twoFactorAuth">Enable two-factor authentication</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={systemSettings.emailNotifications}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
              <Label htmlFor="emailNotifications">Enable email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smsNotifications"
                checked={systemSettings.smsNotifications}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, smsNotifications: checked }))}
              />
              <Label htmlFor="smsNotifications">Enable SMS notifications</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSystem} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save System Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Configure security and access control settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              These settings affect the security of your entire institution. Please review carefully before making changes.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passwordPolicy">Password Policy</Label>
              <Select value={securitySettings.passwordPolicy} onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, passwordPolicy: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - Basic requirements</SelectItem>
                  <SelectItem value="MEDIUM">Medium - Moderate requirements</SelectItem>
                  <SelectItem value="HIGH">High - Strict requirements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="480"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginAttempts">Max Login Attempts</Label>
              <Input
                id="loginAttempts"
                type="number"
                min="3"
                max="10"
                value={securitySettings.loginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: e.target.value }))}
                placeholder="5"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={securitySettings.apiKey}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter API key"
                  readOnly
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="outline">
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={securitySettings.webhookUrl}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://your-domain.com/webhook"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSecurity} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};