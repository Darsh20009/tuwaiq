import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Donate from "@/pages/Donate";
import SetupPassword from "@/pages/SetupPassword";
import Admin from "@/pages/Admin";
import AdminContent from "@/pages/admin/AdminContent";
import AdminPages from "@/pages/admin/AdminPages";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminDonations from "@/pages/admin/AdminDonations";
import AdminTransfers from "@/pages/admin/AdminTransfers";
import AdminNews from "@/pages/admin/AdminNews";
import AdminCampaigns from "@/pages/admin/AdminCampaigns";
import AdminJobs from "@/pages/admin/AdminJobs";
import AdminApplications from "@/pages/admin/AdminApplications";
import PaymentResult from "@/pages/PaymentResult";
import PaymentGatewayDone from "@/pages/PaymentGatewayDone";
import SimulationPayment from "@/pages/SimulationPayment";
import { PaymentProvider } from "@/contexts/payment-context";
import { PaymentOverlay } from "@/components/PaymentOverlay";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import BankAccounts from "@/pages/BankAccounts";
import Contact from "@/pages/Contact";
import Goals from "@/pages/Goals";
import Vision from "@/pages/Vision";
import Founders from "@/pages/Founders";
import GeneralAssembly from "@/pages/GeneralAssembly";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Certificates from "@/pages/Certificates";
import BankTransfer from "@/pages/BankTransfer";
import Campaigns from "@/pages/campaigns/Campaigns";
import CampaignDetail from "@/pages/campaigns/CampaignDetail";
import DonationSuccess from "@/pages/DonationSuccess";
import Impact from "@/pages/Impact";
import Notifications from "@/pages/Notifications";
import {
  AboutPage, BoardPage, AssemblyPage, ProgramsPage, NewslettersPage,
  BeneficiariesPage, JobsPage, ApplyJobPage, VolunteerPage, BylawsPage,
  FinancialsPage, PoliciesPage, CommitteesPage, SatisfactionPage, EthicsPage,
  ExecutivePage, DisclosurePage, NewsPage, NewsDetailPage, BlogPage, ContentPage,
} from "@/pages/ContentPage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicy";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import AdminEmails from "@/pages/admin/AdminEmails";
import PosterGenerator from "@/pages/admin/PosterGenerator";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminAttendance from "@/pages/admin/AdminAttendance";
import AdminLeave from "@/pages/admin/AdminLeave";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminStockMovements from "@/pages/admin/AdminStockMovements";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminDeliveries from "@/pages/admin/AdminDeliveries";
import AdminBeneficiaries from "@/pages/admin/AdminBeneficiaries";
import AdminSEO from "@/pages/admin/AdminSEO";
import AdminQirox from "@/pages/admin/AdminQirox";
import AdminSlider from "@/pages/admin/AdminSlider";
import AdminAI from "@/pages/admin/AdminAI";
import AdminCases from "@/pages/admin/AdminCases";
import AdminAppStore from "@/pages/admin/AdminAppStore";
import CaseFormPage from "@/pages/CaseFormPage";
import ZakatCalculator from "@/pages/ZakatCalculator";
import AdminFAQ from "@/pages/admin/AdminFAQ";
import AdminBanners from "@/pages/admin/AdminBanners";
import AdminTracking from "@/pages/admin/AdminTracking";
import FAQPage from "@/pages/FAQ";
import TrackDonation from "@/pages/TrackDonation";

import EmployeeDashboard from "@/pages/employee/Dashboard";
import EmployeeTransfers from "@/pages/employee/Transfers";
import EmployeeApplications from "@/pages/employee/Applications";
import EmployeeAttendance from "@/pages/employee/Attendance";
import EmployeeLeaveRequests from "@/pages/employee/LeaveRequests";
import EmployeeChat from "@/pages/employee/Chat";
import InternalMail from "@/pages/employee/InternalMail";
import AccountantDashboard from "@/pages/employee/AccountantDashboard";
import ProgrammerDashboard from "@/pages/employee/ProgrammerDashboard";
import SalesDashboard from "@/pages/employee/SalesDashboard";
import EmployeeCases from "@/pages/employee/Cases";

import DeliveryDashboard from "@/pages/delivery/DeliveryDashboard";
import DeliveryOrders from "@/pages/delivery/DeliveryOrders";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DeliverySidebar } from "@/components/DeliverySidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ChevronRight, AlertTriangle, RefreshCw } from "lucide-react";
import { BiometricPromptDialog } from "@/components/BiometricPromptDialog";
import React from "react";

const DASHBOARD_ROOTS = ["/admin", "/employee", "/delivery"];

class PageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[PageErrorBoundary] Render error:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 p-8 text-center" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">حدث خطأ في تحميل هذه الصفحة</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || "خطأ غير متوقع"}
            </p>
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

class SidebarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[SidebarErrorBoundary] Sidebar crash:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-16 h-full bg-background border-l border-border flex flex-col items-center pt-4 gap-3" dir="rtl">
          <button
            title="إعادة تحميل"
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BackBar() {
  const [location] = useLocation();
  const isDashboard = DASHBOARD_ROOTS.some(r => location === r);
  if (isDashboard) return null;
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-1.5 bg-background/90 backdrop-blur-sm border-b border-border/40 print:hidden">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-muted/60"
      >
        <ChevronRight className="h-3.5 w-3.5" />
        رجوع
      </button>
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full" dir="rtl">
          <SidebarErrorBoundary><AppSidebar /></SidebarErrorBoundary>
          <main className="flex-1 overflow-y-auto bg-muted/20">
            <BackBar />
            <PageErrorBoundary>{children}</PageErrorBoundary>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full" dir="rtl">
          <SidebarErrorBoundary><AppSidebar /></SidebarErrorBoundary>
          <main className="flex-1 overflow-y-auto bg-muted/20">
            <BackBar />
            <PageErrorBoundary>{children}</PageErrorBoundary>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full" dir="rtl">
          <DeliverySidebar />
          <main className="flex-1 overflow-y-auto bg-muted/20">
            <BackBar />
            <PageErrorBoundary>{children}</PageErrorBoundary>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

// Role-aware employee dashboard
function RoleBasedEmployeeDashboard() {
  const { user } = useAuth() as any;
  if (user?.role === "accountant") return <AccountantDashboard />;
  if (user?.role === "programmer") return <ProgrammerDashboard />;
  if (user?.role === "sales") return <SalesDashboard />;
  return <EmployeeDashboard />;
}

import AdminReports from "@/pages/admin/AdminReports";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/setup-password" component={SetupPassword} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/donate" component={Donate} />
      <Route path="/payment-simulation" component={SimulationPayment} />
      <Route path="/donation-success" component={DonationSuccess} />
      <Route path="/impact" component={Impact} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/zakat" component={ZakatCalculator} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/:id" component={CampaignDetail} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/track-donation" component={TrackDonation} />

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout><Admin /></AdminLayout>
      </Route>
      <Route path="/admin/pages">
        <AdminLayout><AdminPages /></AdminLayout>
      </Route>
      <Route path="/admin/content">
        <AdminLayout><AdminContent /></AdminLayout>
      </Route>
      <Route path="/admin/news">
        <AdminLayout><AdminNews /></AdminLayout>
      </Route>
      <Route path="/admin/campaigns">
        <AdminLayout><AdminCampaigns /></AdminLayout>
      </Route>
      <Route path="/admin/donations">
        <AdminLayout><AdminDonations /></AdminLayout>
      </Route>
      <Route path="/admin/transfers">
        <AdminLayout><AdminTransfers /></AdminLayout>
      </Route>
      <Route path="/admin/jobs">
        <AdminLayout><AdminJobs /></AdminLayout>
      </Route>
      <Route path="/admin/applications">
        <AdminLayout><AdminApplications /></AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout><AdminUsers /></AdminLayout>
      </Route>
      <Route path="/admin/emails">
        <AdminLayout><AdminEmails /></AdminLayout>
      </Route>
      <Route path="/admin/posters">
        <AdminLayout><PosterGenerator /></AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout><AdminSettings /></AdminLayout>
      </Route>
      <Route path="/admin/seo">
        <AdminLayout><AdminSEO /></AdminLayout>
      </Route>
      <Route path="/admin/qirox">
        <AdminLayout><AdminQirox /></AdminLayout>
      </Route>
      <Route path="/admin/slider">
        <AdminLayout><AdminSlider /></AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout><AdminProducts /></AdminLayout>
      </Route>
      <Route path="/admin/deliveries">
        <AdminLayout><AdminDeliveries /></AdminLayout>
      </Route>
      <Route path="/admin/beneficiaries">
        <AdminLayout><AdminBeneficiaries /></AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout><AdminAnalytics /></AdminLayout>
      </Route>
      <Route path="/admin/reports">
        <AdminLayout><AdminReports /></AdminLayout>
      </Route>
      <Route path="/admin/attendance">
        <AdminLayout><AdminAttendance /></AdminLayout>
      </Route>
      <Route path="/admin/leave">
        <AdminLayout><AdminLeave /></AdminLayout>
      </Route>
      <Route path="/admin/notifications">
        <AdminLayout><AdminNotifications /></AdminLayout>
      </Route>
      <Route path="/admin/stock-movements">
        <AdminLayout><AdminStockMovements /></AdminLayout>
      </Route>
      <Route path="/admin/chat">
        <AdminLayout><EmployeeChat /></AdminLayout>
      </Route>
      <Route path="/admin/mail">
        <AdminLayout><InternalMail /></AdminLayout>
      </Route>
      <Route path="/admin/ai">
        <AdminLayout><AdminAI /></AdminLayout>
      </Route>
      <Route path="/admin/app-store">
        <AdminLayout><AdminAppStore /></AdminLayout>
      </Route>
      <Route path="/admin/cases">
        <AdminLayout><AdminCases /></AdminLayout>
      </Route>
      <Route path="/admin/faq">
        <AdminLayout><AdminFAQ /></AdminLayout>
      </Route>
      <Route path="/admin/banners">
        <AdminLayout><AdminBanners /></AdminLayout>
      </Route>
      <Route path="/admin/tracking">
        <AdminLayout><AdminTracking /></AdminLayout>
      </Route>

      {/* Delivery Agent Routes */}
      <Route path="/delivery">
        <DeliveryLayout><DeliveryDashboard /></DeliveryLayout>
      </Route>
      <Route path="/delivery/orders">
        <DeliveryLayout><DeliveryOrders /></DeliveryLayout>
      </Route>

      {/* Employee Routes */}
      <Route path="/employee">
        <EmployeeLayout><RoleBasedEmployeeDashboard /></EmployeeLayout>
      </Route>
      <Route path="/employee/transfers">
        <EmployeeLayout><EmployeeTransfers /></EmployeeLayout>
      </Route>
      <Route path="/employee/applications">
        <EmployeeLayout><EmployeeApplications /></EmployeeLayout>
      </Route>
      <Route path="/employee/attendance">
        <EmployeeLayout><EmployeeAttendance /></EmployeeLayout>
      </Route>
      <Route path="/employee/leave">
        <EmployeeLayout><EmployeeLeaveRequests /></EmployeeLayout>
      </Route>
      <Route path="/employee/chat">
        <EmployeeLayout><EmployeeChat /></EmployeeLayout>
      </Route>
      <Route path="/employee/mail">
        <EmployeeLayout><InternalMail /></EmployeeLayout>
      </Route>
      <Route path="/employee/tasks">
        <EmployeeLayout><ProgrammerDashboard /></EmployeeLayout>
      </Route>
      <Route path="/employee/posters">
        <EmployeeLayout><PosterGenerator /></EmployeeLayout>
      </Route>
      <Route path="/employee/content">
        <EmployeeLayout><AdminContent /></EmployeeLayout>
      </Route>
      <Route path="/employee/donations">
        <EmployeeLayout><AccountantDashboard /></EmployeeLayout>
      </Route>
      <Route path="/employee/cases">
        <EmployeeLayout><EmployeeCases /></EmployeeLayout>
      </Route>

      {/* Public Case Forms */}
      <Route path="/cases/:slug" component={CaseFormPage} />

      <Route path="/payment-result" component={PaymentResult} />
      <Route path="/payment-gateway-done" component={PaymentGatewayDone} />

      {/* Services */}
      <Route path="/services" component={Services} />
      <Route path="/services/:slug" component={ServiceDetail} />

      {/* Certificates */}
      <Route path="/certificates" component={Certificates} />

      {/* Bank Transfer */}
      <Route path="/bank-transfer" component={BankTransfer} />

      {/* About Section */}
      <Route path="/about" component={AboutPage} />
      <Route path="/goals" component={Goals} />
      <Route path="/vision" component={Vision} />
      <Route path="/founders" component={Founders} />
      <Route path="/general-assembly" component={GeneralAssembly} />
      <Route path="/board" component={BoardPage} />
      <Route path="/assembly" component={AssemblyPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/newsletters" component={NewslettersPage} />

      {/* Services Section */}
      <Route path="/beneficiaries" component={BeneficiariesPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/apply-job" component={ApplyJobPage} />
      <Route path="/volunteer" component={VolunteerPage} />

      {/* Governance Section — legacy paths */}
      <Route path="/bylaws" component={BylawsPage} />
      <Route path="/financials" component={FinancialsPage} />
      <Route path="/policies" component={PoliciesPage} />
      <Route path="/committees" component={CommitteesPage} />
      <Route path="/satisfaction" component={SatisfactionPage} />
      <Route path="/ethics" component={EthicsPage} />
      <Route path="/executive" component={ExecutivePage} />
      <Route path="/disclosure" component={DisclosurePage} />
      {/* Governance Section — /governance/* paths used by navbar */}
      <Route path="/governance/charter" component={BylawsPage} />
      <Route path="/governance/financials" component={FinancialsPage} />
      <Route path="/governance/policies" component={PoliciesPage} />
      <Route path="/governance/committees" component={CommitteesPage} />
      <Route path="/governance/satisfaction" component={SatisfactionPage} />
      <Route path="/governance/ethics" component={EthicsPage} />
      <Route path="/governance/executive" component={ExecutivePage} />
      <Route path="/governance/disclosure" component={DisclosurePage} />

      {/* Other Pages */}
      <Route path="/news" component={NewsPage} />
      <Route path="/news/:id" component={(props: any) => <NewsDetailPage id={props.params.id} />} />
      <Route path="/bank-accounts" component={BankAccounts} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/blog" component={BlogPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const [location] = useLocation();
  const isInternalPage = location.startsWith("/admin") || location.startsWith("/employee") || location.startsWith("/delivery");
  return (
    <>
      <Router />
      <PaymentOverlay />
      <PushNotificationPrompt />
      {!isInternalPage && <WhatsAppButton />}
      {!isInternalPage && <BiometricPromptDialog />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PaymentProvider>
          <Toaster />
          <AppInner />
        </PaymentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
