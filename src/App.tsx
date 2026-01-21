import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { InstitutionManagement } from "@/pages/InstitutionManagement";
import { InstitutionView } from "@/pages/InstitutionView";
import { Departments } from "@/pages/Departments";
import { EmployeePositions } from "@/pages/EmployeePositions";
import { EmployeeManagement } from "@/pages/EmployeeManagement";
import InstitutionMembers from "@/pages/InstitutionMembers";
import { RequestDeduction } from "@/pages/RequestDeduction";
import { DeductionApproval } from "@/pages/DeductionApproval";
import { DueDeductions } from "@/pages/DueDeductions";
import { AllDueDeductions } from "@/pages/AllDueDeductions";
import { AffordabilityCheck } from "@/pages/AffordabilityCheck";
import { UploadDeductions } from "@/pages/UploadDeductions";
import { DeductionCollections } from "@/pages/DeductionCollections";
import { SystemConfiguration } from "@/pages/SystemConfiguration";
import { UserManagement } from "@/pages/UserManagement";
import { UserRoles } from "@/pages/UserRoles";
import { InstitutionSettings } from "@/pages/InstitutionSettings";
import { EmployerInvoices } from "@/pages/EmployerInvoices";
import { ScheduledInvoices } from "@/pages/ScheduledInvoices";
import { HubDeductionProcessing } from "@/pages/HubDeductionProcessing";
import { InstitutionDeductionProcessing } from "@/pages/InstitutionDeductionProcessing";
import { EmployerPaymentFiles } from "@/pages/EmployerPaymentFiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/institutions" element={<AppLayout><InstitutionManagement /></AppLayout>} />
            <Route path="/institutions/:id" element={<AppLayout><InstitutionView /></AppLayout>} />
            <Route path="/deduction-collections" element={<AppLayout><DeductionCollections /></AppLayout>} />
            <Route path="/employer-invoices" element={<AppLayout><EmployerInvoices /></AppLayout>} />
            <Route path="/configuration" element={<AppLayout><SystemConfiguration /></AppLayout>} />
            <Route path="/departments" element={<AppLayout><Departments /></AppLayout>} />
            <Route path="/hr/employees" element={<AppLayout><EmployeeManagement /></AppLayout>} />
            <Route path="/hr/positions" element={<AppLayout><EmployeePositions /></AppLayout>} />
            <Route path="/membership/members" element={<AppLayout><InstitutionMembers /></AppLayout>} />
            <Route path="/deductions/requests" element={<AppLayout><RequestDeduction /></AppLayout>} />
            <Route path="/deductions/upload" element={<AppLayout><UploadDeductions /></AppLayout>} />
            <Route path="/deductions/scheduled" element={<AppLayout><ScheduledInvoices /></AppLayout>} />
            <Route path="/deductions/approvals" element={<AppLayout><DeductionApproval /></AppLayout>} />
            <Route path="/deductions/due" element={<AppLayout><DueDeductions /></AppLayout>} />
            <Route path="/deductions/all-due" element={<AppLayout><AllDueDeductions /></AppLayout>} />
            <Route path="/deductions/affordability" element={<AppLayout><AffordabilityCheck /></AppLayout>} />
            <Route path="/deduction-processing" element={<AppLayout><HubDeductionProcessing /></AppLayout>} />
            <Route path="/deductions/processing" element={<AppLayout><InstitutionDeductionProcessing /></AppLayout>} />
            <Route path="/deductions/employer-payments" element={<AppLayout><EmployerPaymentFiles /></AppLayout>} />
            <Route path="/users" element={<AppLayout><UserManagement /></AppLayout>} />
            <Route path="/users/roles" element={<AppLayout><UserRoles /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><InstitutionSettings /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
