import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import { AppLayout, CandidateLayout } from "@/components/AppLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import CandidateHome from "./pages/candidate/CandidateHome";
import CandidateConsent from "./pages/candidate/CandidateConsent";
import CandidateAssessments from "./pages/candidate/CandidateAssessments";
import AssessmentDelivery from "./pages/candidate/AssessmentDelivery";
import CandidateResults from "./pages/candidate/CandidateResults";

import AdminDashboard from "./pages/admin/AdminDashboard";
import IntakesPage from "./pages/admin/IntakesPage";
import HeatmapPage from "./pages/admin/HeatmapPage";
import RetestsPage from "./pages/admin/RetestsPage";
import ExportsPage from "./pages/admin/ExportsPage";
import RubricPage from "./pages/super/RubricPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Candidate Routes */}
             <Route element={<CandidateLayout />}>
              <Route path="/candidate" element={<CandidateHome />} />
              <Route path="/candidate/consent" element={<CandidateConsent />} />
              <Route path="/candidate/assessments" element={<CandidateAssessments />} />
              <Route path="/candidate/assessments/:attemptId" element={<AssessmentDelivery />} />
              <Route path="/candidate/results/:attemptId" element={<CandidateResults />} />
            </Route>

            {/* Admin & Super Routes */}
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/intakes" element={<IntakesPage />} />
              <Route path="/admin/heatmap" element={<HeatmapPage />} />
              <Route path="/admin/retests" element={<RetestsPage />} />
              <Route path="/admin/exports" element={<ExportsPage />} />
              <Route path="/super/rubric" element={<RubricPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>

            {/* Default redirect */}
            <Route index element={<LoginPage />} />
            <Route path="/" element={<LoginPage />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
