import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Delegates from './pages/Delegates';
import Announcements from './pages/Announcements';
import LeaveForms from './pages/LeaveForms';
import LeaveTypes from './pages/LeaveTypes';
import GroupChats from './pages/GroupChats';
import AuditLogs from './pages/AuditLogs';
import SecurityLogs from './pages/SecurityLogs';
import DirectMessages from './pages/DirectMessages';
import Notifications from './pages/Notifications';
import ConnectionRequests from './pages/ConnectionRequests';
import Maintenance from './pages/Maintenance';
import DelegateChat from './pages/DelegateChat';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const adminToken = localStorage.getItem('admin_token');
  const delegateToken = localStorage.getItem('delegate_token');
  
  if (!adminToken && !delegateToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="delegates" element={<Delegates />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="leave-forms" element={<LeaveForms />} />
            <Route path="leave-types" element={<LeaveTypes />} />
            <Route path="group-chats" element={<GroupChats />} />
            <Route path="direct-messages" element={<DirectMessages />} />
            <Route path="delegate-chat" element={<DelegateChat />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="security-logs" element={<SecurityLogs />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="connection-requests" element={<ConnectionRequests />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
