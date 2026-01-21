import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { deductionFilesService, DeductionFile } from '@/services/deductionFilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  Download
} from 'lucide-react';

export const DeductionCollections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [files, setFiles] = useState<DeductionFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  
  // Dialog states
  const [selectedFile, setSelectedFile] = useState<DeductionFile | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [statusFilter, institutionFilter, currentPage]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await deductionFilesService.getAllDeductionFiles(
        statusFilter,
        currentPage,
        20,
        institutionFilter !== 'all' ? institutionFilter : undefined
      );
      
      setFiles(response.data.files || []);
      setPagination(response.data.pagination || null);
      setSummary(response.data.summary || null);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load deduction files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedFile) return;
    
    try {
      setActionLoading(true);
      await deductionFilesService.approveDeductionFile(selectedFile.id, approvalComment);
      
      toast({
        title: "File Approved",
        description: `Deduction file from ${selectedFile.institution_name || 'institution'} has been approved successfully.`,
      });
      
      setShowApprovalDialog(false);
      setApprovalComment('');
      setSelectedFile(null);
      await loadFiles();
    } catch (error) {
      console.error('Error approving file:', error);
      toast({
        title: "Error",
        description: "Failed to approve file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedFile) return;
    
    try {
      setActionLoading(true);
      await deductionFilesService.rejectDeductionFile(selectedFile.id, rejectionComment);
      
      toast({
        title: "File Rejected",
        description: `Deduction file from ${selectedFile.institution_name || 'institution'} has been rejected.`,
      });
      
      setShowRejectionDialog(false);
      setRejectionComment('');
      setSelectedFile(null);
      await loadFiles();
    } catch (error) {
      console.error('Error rejecting file:', error);
      toast({
        title: "Error",
        description: "Failed to reject file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (file: DeductionFile) => {
    switch (file.status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileCheck className="h-8 w-8" />
          Deduction Collections
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and approve deduction files uploaded by all institutions
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                  <p className="text-2xl font-bold">{summary.total_files}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{summary.uploaded_files}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{summary.approved_files}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_amount_uploaded)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files, institutions, or comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="UPLOADED">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Deduction Files ({filteredFiles.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading files...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deduction files found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.institution_name || 'Unknown Institution'}</p>
                            <p className="text-sm text-muted-foreground">ID: {file.institution_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{file.original_filename}</p>
                          <p className="text-sm text-muted-foreground">{file.comment}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(file.total_invoice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          {file.records_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatDate(file.created_on)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(file)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(file);
                              setShowDetailsDialog(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {file.status === 'UPLOADED' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedFile(file);
                                  setShowApprovalDialog(true);
                                }}
                                title="Approve File"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedFile(file);
                                  setShowRejectionDialog(true);
                                }}
                                title="Reject File"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Deduction File
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                You are about to approve the deduction file from <strong>{selectedFile?.institution_name}</strong>
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm"><strong>File:</strong> {selectedFile?.original_filename}</p>
                <p className="text-sm"><strong>Amount:</strong> {selectedFile && formatCurrency(selectedFile.total_invoice)}</p>
                <p className="text-sm"><strong>Records:</strong> {selectedFile?.records_count || 0}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Approval Comment (Optional)</label>
              <Textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Add any comments about this approval..."
                className="min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalDialog(false);
                  setApprovalComment('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve File
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Deduction File
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                You are about to reject the deduction file from <strong>{selectedFile?.institution_name}</strong>
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm"><strong>File:</strong> {selectedFile?.original_filename}</p>
                <p className="text-sm"><strong>Amount:</strong> {selectedFile && formatCurrency(selectedFile.total_invoice)}</p>
                <p className="text-sm"><strong>Records:</strong> {selectedFile?.records_count || 0}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason <span className="text-red-500">*</span></label>
              <Textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Please provide a reason for rejecting this file..."
                className="min-h-[80px] resize-none"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionDialog(false);
                  setRejectionComment('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading || !rejectionComment.trim()}
                variant="destructive"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject File
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              File Details
            </DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution</label>
                  <p className="font-medium">{selectedFile.institution_name || 'Unknown Institution'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution ID</label>
                  <p className="font-medium">{selectedFile.institution_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File Name</label>
                  <p className="font-medium">{selectedFile.original_filename}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedFile)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                  <p className="font-medium text-lg">{formatCurrency(selectedFile.total_invoice)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Records Count</label>
                  <p className="font-medium">{selectedFile.records_count || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Upload Date</label>
                  <p className="font-medium">{formatDate(selectedFile.created_on)}</p>
                </div>
                {selectedFile.approved_on && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Approval Date</label>
                    <p className="font-medium">{formatDate(selectedFile.approved_on)}</p>
                  </div>
                )}
              </div>

              {selectedFile.comment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Comments</label>
                  <div className="bg-gray-50 p-3 rounded mt-1">
                    <p>{selectedFile.comment}</p>
                  </div>
                </div>
              )}

              {selectedFile.approved_by && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {selectedFile.status === 'APPROVED' ? 'Approved By' : 'Processed By'}
                  </label>
                  <p className="font-medium">{selectedFile.approved_by}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
