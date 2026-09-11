import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Real Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import CreateEventWizard from './pages/client/CreateEventWizard';
import ClientProposals from './pages/client/ClientProposals';
import EventWorkspaceClient from './pages/client/EventWorkspaceClient';

// Real Planner Pages
import PlannerDashboard from './pages/planner/PlannerDashboard';
import PlannerLeads from './pages/planner/PlannerLeads';
import EventWorkspacePlanner from './pages/planner/EventWorkspacePlanner';
// @ts-ignore
import AICanvasPage from './pages/planner/AICanvasPage';

// Professional Pages
import ProOpportunities from './pages/professional/ProOpportunities';

// Placeholder Component
const Placeholder = ({ title }: { title: string }) => (
  <div className="card text-center py-12">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="text-slate-500">This module is part of the architecture but not yet implemented in this view.</p>
  </div>
);

import { AuthProvider, useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading, role } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><DashboardLayout role="client" /></ProtectedRoute>}>
        <Route index element={<ClientDashboard />} />
        <Route path="events" element={<ClientDashboard />} />
        <Route path="events/new" element={<CreateEventWizard />} />
        <Route path="events/:eventId" element={<EventWorkspaceClient />} />
        <Route path="proposals" element={<ClientProposals />} />
        <Route path="messages" element={<Placeholder title="Messages" />} />
      </Route>

      <Route path="/planner" element={<ProtectedRoute allowedRoles={['planner']}><DashboardLayout role="planner" /></ProtectedRoute>}>
        <Route index element={<PlannerDashboard />} />
        <Route path="leads" element={<PlannerLeads />} />
        <Route path="events" element={<Placeholder title="All Events (Use Dashboard instead)" />} />
        <Route path="events/:eventId" element={<EventWorkspacePlanner />} />
        <Route path="proposals" element={<Placeholder title="Sent Proposals" />} />
        <Route path="ai-canvas" element={<AICanvasPage />} />
        <Route path="vendors" element={<Placeholder title="Vendors" />} />
        <Route path="tasks" element={<Placeholder title="Tasks" />} />
        <Route path="messages" element={<Placeholder title="Messages" />} />
      </Route>

      <Route path="/professional" element={<ProtectedRoute allowedRoles={['professional']}><DashboardLayout role="professional" /></ProtectedRoute>}>
        <Route index element={<Placeholder title="Professional Dashboard" />} />
        <Route path="opportunities" element={<ProOpportunities />} />
        <Route path="applications" element={<Placeholder title="Applications" />} />
        <Route path="projects" element={<Placeholder title="Projects" />} />
        <Route path="messages" element={<Placeholder title="Messages" />} />
      </Route>
      
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
        <Route index element={<Placeholder title="Admin Dashboard" />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
