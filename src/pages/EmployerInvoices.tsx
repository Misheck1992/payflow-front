import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { employerInvoicesService, EmployerInvoiceFile, EmployerInvoicesFilters } from '@/services/employerInvoicesService';

export const EmployerInvoices = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<EmployerInvoiceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [approvingFiles, setApprovingFiles] = useState<Set<number>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [summary, setSummary] = useState({
    total_files: 0,
    active_files: 0,
    elapsed_files: 0,
    total_institutions: 0,
    files_generated_today: 0,
    institutions_processed_today: 0
  });
  const [filters, setFilters] = useState<EmployerInvoicesFilters>({});
  const [availableFilters, setAvailableFilters] = useState({
    periods: [] as string[],
    statuses: [] as string[]
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployerInvoices();
  }, [filters]);

  const loadEmployerInvoices = async () => {
    try {
      setLoading(true);
      const response = await employerInvoicesService.getEmployerInvoices(filters);
      setFiles(response.data.files);
      setSummary(response.data.summary);
      setAvailableFilters({
        periods: response.data.filters.available_periods,
        statuses: response.data.filters.available_statuses
      });
    } catch (error) {
      console.error('Error loading employer invoices:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load employer invoices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: EmployerInvoiceFile) => {
    try {
      setDownloadingFiles(prev => new Set(prev).add(file.filename));
      await employerInvoicesService.downloadFile(file.filename);
      toast({
        title: "Download Started",
        description: `Downloading ${file.filename}`
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.filename);
        return newSet;
      });
    }
  };

  const handleApprove = async (file: EmployerInvoiceFile) => {
    try {
      setApprovingFiles(prev => new Set(prev).add(file.id));
      const response = await employerInvoicesService.approveEmployerInvoice(file.id);

      // Update the file in the local state
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'Approved' as const } : f
      ));

      toast({
        title: "Invoice Approved",
        description: response.message || `Successfully approved ${file.filename}`
      });
    } catch (error) {
      console.error('Error approving invoice:', error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApprovingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedFiles.size === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to approve.",
        variant: "destructive"
      });
      return;
    }

    try {
      setBulkApproving(true);
      const ids = Array.from(selectedFiles);
      const response = await employerInvoicesService.bulkApproveEmployerInvoices(ids);

      // Update approved files in the local state
      if (response.data.approved_ids.length > 0) {
        setFiles(prev => prev.map(f =>
          response.data.approved_ids.includes(f.id) ? { ...f, status: 'Approved' as const } : f
        ));
      }

      // Clear selection
      setSelectedFiles(new Set());

      // Show summary toast
      const { summary, errors } = response.data;
      toast({
        title: "Bulk Approval Complete",
        description: `Approved: ${summary.approved} of ${summary.total} files${errors.length > 0 ? `, Failed: ${summary.failed}` : ''}`,
        variant: errors.length > 0 ? "default" : "default"
      });

      // Show individual errors if any
      if (errors.length > 0) {
        errors.forEach(err => {
          const file = files.find(f => f.id === err.id);
          toast({
            title: `Failed: ${file?.filename || err.id}`,
            description: err.error,
            variant: "destructive"
          });
        });
      }
    } catch (error) {
      console.error('Error bulk approving invoices:', error);
      toast({
        title: "Bulk Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve invoices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setBulkApproving(false);
    }
  };

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const filteredFiles = files.filter(file => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      file.institution_name.toLowerCase().includes(searchLower) ||
      file.institution_code.toLowerCase().includes(searchLower) ||
      file.filename.toLowerCase().includes(searchLower) ||
      file.payment_period.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Active': 'bg-green-100 text-green-800',
      'Elapsed': 'bg-red-100 text-red-800',
      'Approved': 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return 'text-blue-600'; // Future/Today
    if (days <= 1) return 'text-green-600'; // Recent
    if (days <= 7) return 'text-yellow-600'; // This week
    return 'text-red-600'; // Old
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employer Invoices</h1>
          <p className="text-muted-foreground mt-1">Monitor Excel files generated for employer payments</p>
        </div>
        <div className="flex gap-2">
          {selectedFiles.size > 0 && (
            <Button
              onClick={handleBulkApprove}
              disabled={bulkApproving}
              variant="default"
            >
              {bulkApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Approve Selected ({selectedFiles.size})
            </Button>
          )}
          <Button onClick={loadEmployerInvoices} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{summary.total_files}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Active Files</p>
                <p className="text-2xl font-bold">{summary.active_files}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Elapsed Files</p>
                <p className="text-2xl font-bold">{summary.elapsed_files}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Institutions</p>
                <p className="text-2xl font-bold">{summary.total_institutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Today's Files</p>
                <p className="text-2xl font-bold">{summary.files_generated_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-teal-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Processed Today</p>
                <p className="text-2xl font-bold">{summary.institutions_processed_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search institutions, codes, or files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableFilters.statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.period || 'all'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, period: value === 'all' ? undefined : value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                {availableFilters.periods.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Files</CardTitle>
          <CardDescription>
            Showing {filteredFiles.length} of {files.length} files
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>File Details</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2">Loading employer invoices...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No invoice files found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'No employer invoice files have been generated yet.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        disabled={file.status === 'Approved' || file.status === 'Elapsed'}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{file.institution_name}</p>
                        <p className="text-sm text-muted-foreground">{file.institution_code}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {file.institution_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {file.file_size_mb}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{file.payment_period}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(file.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(file.generated_on)}</p>
                        <p className={`text-xs ${getDaysColor(file.days_since_generated)}`}>
                          {file.days_since_generated < 0
                            ? 'Today'
                            : file.days_since_generated === 0
                            ? 'Today'
                            : `${file.days_since_generated} days ago`
                          }
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{file.contact_email}</p>
                        <p className="text-muted-foreground">{file.contact_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {file.status === 'Active' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(file)}
                            disabled={approvingFiles.has(file.id)}
                            title="Approve Invoice"
                          >
                            {approvingFiles.has(file.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          disabled={downloadingFiles.has(file.filename)}
                          title="Download File"
                        >
                          {downloadingFiles.has(file.filename) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {file.status === 'Active' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(file)} disabled={approvingFiles.has(file.id)}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(file)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
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
    </div>
  );
};