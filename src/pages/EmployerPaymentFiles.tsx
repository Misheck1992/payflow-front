import React, { useState, useEffect } from 'react';
import {
  FileText,
  Filter,
  Search,
  Calendar,
  Building,
  DollarSign,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTokenHandler } from '@/hooks/useTokenHandler';
import {
  employerPaymentFilesService,
  EmployerPaymentFile,
  EmployerPaymentFilesFilters
} from '@/services/employerPaymentFilesService';

export const EmployerPaymentFiles = () => {
  const { toast } = useToast();
  const { handleError } = useTokenHandler();

  const [files, setFiles] = useState<EmployerPaymentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filters, setFilters] = useState<EmployerPaymentFilesFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });

  useEffect(() => {
    loadPaymentFiles();
  }, [filters]);

  const loadPaymentFiles = async () => {
    try {
      setLoading(true);
      const response = await employerPaymentFilesService.getEmployerPaymentFiles(filters);
      setFiles(response.data.files);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading payment files:', error);

      const wasTokenExpired = handleError(error);
      if (!wasTokenExpired) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load payment files. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: EmployerPaymentFile) => {
    try {
      setDownloading(file.file_name);
      const blob = await employerPaymentFilesService.downloadPaymentFile(file.file_name);
      employerPaymentFilesService.downloadFileToDevice(blob, file.file_name);

      toast({
        title: "Success",
        description: `File "${file.file_name}" downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);

      const wasTokenExpired = handleError(error);
      if (!wasTokenExpired) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to download file. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setDownloading(null);
    }
  };

  const filteredFiles = files.filter(file => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      file.file_name?.toLowerCase().includes(searchLower) ||
      file.employer_name?.toLowerCase().includes(searchLower) ||
      file.employer_code?.toLowerCase().includes(searchLower) ||
      file.batch_no?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
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

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Calculate summary stats
  const totalAmount = filteredFiles.reduce((sum, file) => sum + file.total_amount, 0);
  const uniqueEmployers = new Set(filteredFiles.map(file => file.employer_institution_id)).size;
  const uniqueBatches = new Set(filteredFiles.map(file => file.batch_no)).size;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employer Commitments</h1>
          <p className="text-muted-foreground mt-1">View and download commitment files from employers</p>
        </div>
        <Button onClick={loadPaymentFiles} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{filteredFiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Employers</p>
                <p className="text-2xl font-bold">{uniqueEmployers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Batches</p>
                <p className="text-2xl font-bold">{uniqueBatches}</p>
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
                placeholder="Search files, employers, batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Input
              type="date"
              placeholder="Start Date"
              value={filters.start_date || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-40"
            />

            <Input
              type="date"
              placeholder="End Date"
              value={filters.end_date || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-40"
            />

            <Input
              placeholder="Batch Number"
              value={filters.batch_no || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, batch_no: e.target.value }))}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commitment Files</CardTitle>
          <CardDescription>
            Showing {filteredFiles.length} of {files.length} files
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Employer</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2">Loading files...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No files found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'No commitment files available.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow key={file.employer_payment_id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium text-sm truncate" title={file.file_name}>
                          {file.file_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{file.employer_name}</p>
                        <p className="text-xs text-muted-foreground">{file.employer_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{file.batch_no}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{formatCurrency(file.total_amount)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{formatDate(file.processed_on)}</p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        disabled={downloading === file.file_name}
                        className="w-full"
                      >
                        {downloading === file.file_name ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} files
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.has_prev}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};