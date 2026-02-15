import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Donate from "@/pages/Donate";
import Admin from "@/pages/Admin";
import GeideaCallback from "@/pages/GeideaCallback";
import BankAccounts from "@/pages/BankAccounts";
import Contact from "@/pages/Contact";
import Goals from "@/pages/Goals";
import Vision from "@/pages/Vision";
import Founders from "@/pages/Founders";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Certificates from "@/pages/Certificates";
import BankTransfer from "@/pages/BankTransfer";
import {
  AboutPage,
  BoardPage,
  AssemblyPage,
  ProgramsPage,
  NewslettersPage,
  BeneficiariesPage,
  JobsPage,
  ApplyJobPage,
  VolunteerPage,
  BylawsPage,
  FinancialsPage,
  PoliciesPage,
  CommitteesPage,
  SatisfactionPage,
  EthicsPage,
  ExecutivePage,
  DisclosurePage,
  NewsPage,
  BlogPage,
  ContentPage,
} from "@/pages/ContentPage";

import { WhatsAppButton } from "@/components/WhatsAppButton";

import AdminEmails from "@/pages/admin/emails";
import EmployeeDashboard from "@/pages/employee/Dashboard";
import EmployeeTransfers from "@/pages/employee/Transfers";
import EmployeeApplications from "@/pages/employee/Applications";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/donate" component={Donate} />
      
      {/* Admin Protected Routes */}
      <Route path="/admin">
        <SidebarProvider>
          <div className="flex h-screen w-full" dir="rtl">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto bg-muted/20">
              <Admin />
            </main>
          </div>
        </SidebarProvider>
      </Route>
      <Route path="/admin/emails">
        <SidebarProvider>
          <div className="flex h-screen w-full" dir="rtl">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto bg-muted/20">
              <AdminEmails />
            </main>
          </div>
        </SidebarProvider>
      </Route>

      {/* Employee Protected Routes */}
      <Route path="/employee">
        <SidebarProvider>
          <div className="flex h-screen w-full" dir="rtl">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto bg-muted/20">
              <EmployeeDashboard />
            </main>
          </div>
        </SidebarProvider>
      </Route>
      <Route path="/employee/transfers">
        <SidebarProvider>
          <div className="flex h-screen w-full" dir="rtl">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto bg-muted/20">
              <EmployeeTransfers />
            </main>
          </div>
        </SidebarProvider>
      </Route>
      <Route path="/employee/applications">
        <SidebarProvider>
          <div className="flex h-screen w-full" dir="rtl">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto bg-muted/20">
              <EmployeeApplications />
            </main>
          </div>
        </SidebarProvider>
      </Route>
      
      <Route path="/api/donations/callback" component={GeideaCallback} />
      
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
      <Route path="/board" component={BoardPage} />
      <Route path="/assembly" component={AssemblyPage} />
      <Route path="/programs" component={ProgramsPage} />
      <Route path="/newsletters" component={NewslettersPage} />
      
      {/* Services Section */}
      <Route path="/beneficiaries" component={BeneficiariesPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/apply-job" component={ApplyJobPage} />
      <Route path="/volunteer" component={VolunteerPage} />
      
      {/* Governance Section */}
      <Route path="/bylaws" component={BylawsPage} />
      <Route path="/financials" component={FinancialsPage} />
      <Route path="/policies" component={PoliciesPage} />
      <Route path="/committees" component={CommitteesPage} />
      <Route path="/satisfaction" component={SatisfactionPage} />
      <Route path="/ethics" component={EthicsPage} />
      <Route path="/executive" component={ExecutivePage} />
      <Route path="/disclosure" component={DisclosurePage} />
      
      {/* Other Pages */}
      <Route path="/news" component={NewsPage} />
      <Route path="/news/:slug" component={(props: any) => <ContentPage title="خبر" slug={props.params.slug} />} />
      <Route path="/bank-accounts" component={BankAccounts} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={BlogPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem('hasVisited');
    if (visited) {
      setShowSplash(false);
      setHasVisited(true);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasVisited', 'true');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatePresence mode="wait">
          {showSplash && !hasVisited && (
            <SplashScreen onFinish={handleSplashFinish} />
          )}
        </AnimatePresence>
        <Toaster />
        <Router />
        <WhatsAppButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
