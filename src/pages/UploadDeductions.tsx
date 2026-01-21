import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Upload, FileSpreadsheet, Calendar, User, Search, Download, Loader2, CheckCircle, Clock, AlertCircle, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface DeductionFile {
  id: number;
  institution_id: string;
  file: string;
  total_invoice: string;
  approved_by: string;
  created_on: string;
  approved_on: string | null;
  comment: string;
  // Computed/derived fields
  status?: 'UPLOADED' | 'APPROVED' | 'REJECTED';
  file_size?: string;
  original_filename?: string;
  records_count?: number;
  processed_amount?: string;
  pending_approval?: boolean;
}

interface FileAnalysis {
  total_records: number;
  valid_records: number;
  invalid_records: number;
  total_amount: string;
  records_by_status: {
    PROCESSED: number;
    PENDING: number;
    FAILED: number;
  };
  sample_records: Array<{
    row: number;
    request_number: string;
    employee_number: string;
    employee_name: string;
    amount: string;
    status: string;
  }>;
  validation_errors: string[];
}

interface UploadResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    file: DeductionFile;
    file_analysis: FileAnalysis;
  };
}

interface FilesListResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    files: DeductionFile[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    summary?: {
      total_files: number;
      uploaded_files: number;
      approved_files: number;
      rejected_files: number;
      total_amount_uploaded: string;
      total_amount_approved: string;
      total_amount_pending: string;
    };
  };
}

interface DeductionSummary {
  total_requests: number;
  approved_requests: number;
  processed_requests: number;
  total_amount: string;
  reservation_requests: number;
  earliest_request: string;
  latest_request: string;
}

interface SummaryResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    summary: DeductionSummary;
    export_ready: boolean;
  };
}


export const UploadDeductions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<DeductionSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [files, setFiles] = useState<DeductionFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filesSummary, setFilesSummary] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadResult, setUploadResult] = useState<FileAnalysis | null>(null);
  const [showUploadResult, setShowUploadResult] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<DeductionFile | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  const [setExportingExcel] = useState(() => () => {});

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    loadSummary();
    loadFiles();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [statusFilter, currentPage]);

  const getAuthToken = (): string => {
    return localStorage.getItem('payflow_token') || '';
  };

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      const response = await fetch(`${baseUrl}/api/deduction-processing/export/summary`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch summary: ${response.status}`);
      }

      const data: SummaryResponse = await response.json();
      setSummary(data.data.summary);
      setExportReady(data.data.export_ready || false);
    } catch (error) {
      console.error('Error loading summary:', error);
      toast({
        title: "Error",
        description: "Failed to load deduction summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadFiles = async (status = statusFilter, page = currentPage) => {
    try {
      setFilesLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('limit', '10');
      queryParams.append('page', page.toString());
      if (status !== 'all') {
        queryParams.append('status', status);
      }

      const response = await fetch(`${baseUrl}/api/deduction-processing/files?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }

      const data: FilesListResponse = await response.json();

      // Process files and add computed fields
      const processedFiles = data.data.files.map(file => {
        // Extract filename from file path
        const filename = file.file.split('\\').pop() || file.file.split('/').pop() || 'Unknown file';

        // Determine status based on approved_on field
        let status: 'UPLOADED' | 'APPROVED' | 'REJECTED' = 'UPLOADED';
        if (file.approved_on && file.approved_on !== null) {
          status = 'APPROVED';
        }

        // Extract record count from comment if available
        const recordMatch = file.comment.match(/(\d+)\s+records/);
        const records_count = recordMatch ? parseInt(recordMatch[1]) : 0;

        return {
          ...file,
          original_filename: filename,
          status,
          records_count,
          pending_approval: !file.approved_on && !file.approved_by,
          file_size: '0', // Not provided by API
          processed_amount: file.approved_on ? file.total_invoice : '0.00'
        };
      });

      setFiles(processedFiles);
      setFilesSummary(data.data.summary || null);
      setPagination(data.data.pagination || null);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setFilesLoading(false);
    }
  };


  const filteredFiles = files.filter(file =>
    file.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('deduction_file', selectedFile);

      const response = await fetch(`${baseUrl}/api/deduction-processing/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload: ${response.status}`);
      }

      const data: UploadResponse = await response.json();
      setUploadResult(data.data.file_analysis);
      setShowUploadResult(true);
      setSelectedFile(null);

      // Refresh the files list and summary
      await Promise.all([loadFiles(), loadSummary()]);

      toast({
        title: "Upload Successful",
        description: `File uploaded successfully. ${data.data.file_analysis.valid_records} valid records processed.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      'APPROVED': 'default',
      'UPLOADED': 'secondary',
      'REJECTED': 'destructive'
    };

    return (
      <Badge variant={variants[status || 'UPLOADED'] || 'secondary'}>
        {status || 'UPLOADED'}
      </Badge>
    );
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Deductions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage deduction files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadSummary}
            disabled={loadingSummary}
            className="flex items-center gap-2"
          >
            {loadingSummary ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Refresh Summary
          </Button>
        </div>
      </div>

      {/* Deduction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Deduction Processing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSummary ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading summary...</span>
            </div>
          ) : summary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Requests</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.total_requests}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Approved</span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.approved_requests}</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Processed</span>
                </div>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{summary.processed_requests}</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Amount</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(summary.total_amount)}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Earliest Request</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(summary.earliest_request)}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Latest Request</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(summary.latest_request)}</p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Reservations</span>
                </div>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{summary.reservation_requests}</p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Export Status</span>
                </div>
                <div className="flex items-center gap-2">
                  {exportReady ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Ready</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Ready</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Summary Available</h4>
              <p className="text-gray-600 mb-4">
                Unable to load deduction processing summary.
              </p>
              <Button onClick={loadSummary} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Deduction File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Upload History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      File Name
                    </div>
                  </TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Upload Date
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Loading files...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-center">
                        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          No files found
                        </h3>
                        <p className="text-sm text-gray-500">
                          {searchTerm ? 'Try adjusting your search criteria.' : 'Upload your first deduction file to get started.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          <span className="truncate">{file.original_filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>{file.file_size ? formatFileSize(file.file_size) : 'N/A'}</TableCell>
                      <TableCell>{file.records_count?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(file.total_invoice)}</TableCell>
                      <TableCell>{formatDateTime(file.created_on)}</TableCell>
                      <TableCell>
                        {getStatusBadge(file.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFileForPreview(file);
                              setShowPreviewModal(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {file.pending_approval && (
                            <Badge variant="outline" className="text-xs">
                              Pending Approval
                            </Badge>
                          )}
                          {file.approved_on && (
                            <Badge variant="default" className="text-xs">
                              Approved {formatDate(file.approved_on)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} files
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(pagination.page - 1);
                    loadFiles(statusFilter, pagination.page - 1);
                  }}
                  disabled={!pagination.has_prev}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(pagination.page + 1);
                    loadFiles(statusFilter, pagination.page + 1);
                  }}
                  disabled={!pagination.has_next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Files count when no pagination */}
          {!pagination && files.length > 0 && (
            <div className="mt-6 text-sm text-gray-700">
              Showing {files.length} file(s)
            </div>
          )}

          {/* Upload Result Dialog */}
          {uploadResult && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">Upload Analysis Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{uploadResult.total_records}</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Total Records</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{uploadResult.valid_records}</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Valid Records</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{uploadResult.invalid_records}</p>
                  <p className="text-sm text-red-800 dark:text-red-200">Invalid Records</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(uploadResult.total_amount)}</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Total Amount</p>
                </div>
              </div>

              {uploadResult.sample_records.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Sample Records:</h5>
                  <div className="space-y-2">
                    {uploadResult.sample_records.slice(0, 3).map((record, index) => (
                      <div key={index} className="text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                        <span className="font-medium">{record.employee_name}</span> ({record.employee_number}) - {formatCurrency(record.amount)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadResult.validation_errors.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">Validation Errors:</h5>
                  <div className="space-y-1">
                    {uploadResult.validation_errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setUploadResult(null)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Details Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedFileForPreview?.original_filename}
            </DialogDescription>
          </DialogHeader>

          {selectedFileForPreview && (
            <div className="space-y-6">
              {/* File Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">File Information</h4>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">File Name</Label>
                    <p className="text-sm">{selectedFileForPreview.original_filename}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">File ID</Label>
                    <p className="text-sm">#{selectedFileForPreview.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Upload Date</Label>
                    <p className="text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDateTime(selectedFileForPreview.created_on)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedFileForPreview.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Processing Details</h4>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                    <p className="text-sm font-semibold text-green-600">{formatCurrency(selectedFileForPreview.total_invoice)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Records Count</Label>
                    <p className="text-sm">{selectedFileForPreview.records_count?.toLocaleString() || 'N/A'}</p>
                  </div>
                  {selectedFileForPreview.approved_by && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Approved By</Label>
                      <p className="text-sm">{selectedFileForPreview.approved_by}</p>
                    </div>
                  )}
                  {selectedFileForPreview.approved_on && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Approved On</Label>
                      <p className="text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        {formatDateTime(selectedFileForPreview.approved_on)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Section */}
              {selectedFileForPreview.comment && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Comment</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedFileForPreview.comment}
                    </p>
                  </div>
                </div>
              )}

              {/* File Path */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg border-b pb-2">System Information</h4>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">File Path</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono break-all">
                    {selectedFileForPreview.file}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Institution ID</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {selectedFileForPreview.institution_id}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};