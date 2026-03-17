import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vetting from './pages/Vetting';
import AiMarketing from './pages/AiMarketing';
import NotFound from './pages/NotFound';
import UserManagement from './pages/UserManagement';
import JobMonitoring from './pages/JobMonitoring';
import UserProfile from './pages/UserProfile';
import Finance from './pages/Finance';
import ContractorView from './pages/ContractorView';
import ContracteeView from './pages/ContracteeView';
import AiPricingEngine from './pages/AiPricingEngine';
import { UserRole } from './types';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { currentUser, impersonatedUser } = useAuth();

  return (
    <Routes>
      {!currentUser ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <Route path="/" element={<Layout />}>
          {impersonatedUser ? (
             <>
                <Route
                    path="dashboard"
                    element={
                    impersonatedUser.role === UserRole.Contractor
                        ? <ContractorView user={impersonatedUser} />
                        : <ContracteeView user={impersonatedUser} />
                    }
                />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            <>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vetting" element={<Vetting />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/:userId" element={<UserProfile />} />
                <Route path="jobs" element={<JobMonitoring />} />
                <Route path="finance" element={<Finance />} />
                
                {/* Admin-only routes are now properly protected */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.Admin]} />}>
                    <Route path="ai-pricing" element={<AiPricingEngine />} />
                    <Route path="ai-marketing" element={<AiMarketing />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </>
          )}
        </Route>
      )}
    </Routes>
  );
}

export default App;
