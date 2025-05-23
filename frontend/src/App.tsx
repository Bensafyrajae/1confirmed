import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { EventFormPage } from '@/pages/EventFormPage';
import { RecipientsPage } from '@/pages/RecipientsPage';
import { RecipientDetailPage } from '@/pages/RecipientDetailPage';
import { RecipientFormPage } from '@/pages/RecipientFormPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { MessageDetailPage } from '@/pages/MessageDetailPage';
import { MessageFormPage } from '@/pages/MessageFormPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Events routes */}
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events/new" 
              element={
                <ProtectedRoute>
                  <EventFormPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events/:id" 
              element={
                <ProtectedRoute>
                  <EventDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events/:id/edit" 
              element={
                <ProtectedRoute>
                  <EventFormPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Recipients routes */}
            <Route 
              path="/recipients" 
              element={
                <ProtectedRoute>
                  <RecipientsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipients/new" 
              element={
                <ProtectedRoute>
                  <RecipientFormPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipients/:id" 
              element={
                <ProtectedRoute>
                  <RecipientDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipients/:id/edit" 
              element={
                <ProtectedRoute>
                  <RecipientFormPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Messages routes */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages/new" 
              element={
                <ProtectedRoute>
                  <MessageFormPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages/:id" 
              element={
                <ProtectedRoute>
                  <MessageDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages/:id/edit" 
              element={
                <ProtectedRoute>
                  <MessageFormPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Analytics route */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Settings route */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;