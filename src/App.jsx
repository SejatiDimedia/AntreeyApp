import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { BookingsPage } from './pages/Bookings/BookingsPage';
import { QueueTvPage } from './pages/Bookings/QueueTvPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CustomerAppFlow } from './pages/CustomerApp/CustomerAppFlow';
import { StaffPage } from './pages/Staff/StaffPage';
import { ServicesPage } from './pages/Services/ServicesPage';
import { ResourcesPage } from './pages/Resources/ResourcesPage';
import { CustomersPage } from './pages/Customers/CustomersPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { SignIn } from './pages/Auth/SignIn';
import { SignUp } from './pages/Auth/SignUp';
import { LandingPage } from './pages/LandingPage';

const adminPages = ['/dashboard', '/bookings', '/staff', '/services', '/customers', '/settings'];

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, role, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/signin" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/customer-app" replace />;
  return children;
}

function App() {
  const { currentUser, role, loading } = useAuth();
  if (loading) return null;

  const defaultAuthedPath = role === 'owner' || role === 'admin' || role === 'staff' ? '/dashboard' : '/customer-app';

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to={defaultAuthedPath} replace /> : <LandingPage />} />
      <Route path="/signin" element={currentUser ? <Navigate to={defaultAuthedPath} replace /> : <SignIn />} />
      <Route path="/signup" element={currentUser ? <Navigate to={defaultAuthedPath} replace /> : <SignUp />} />

      <Route path="/customer-app" element={<CustomerAppFlow />} />
      <Route path="/b/:businessId" element={<CustomerAppFlow />} />

      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'staff']}><MainLayout title="Dashboard"><DashboardPage /></MainLayout></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'staff']}><MainLayout title="Bookings" activeCount={12}><BookingsPage /></MainLayout></ProtectedRoute>} />
      <Route path="/queue-tv" element={<ProtectedRoute allowedRoles={['owner', 'admin', 'staff']}><QueueTvPage /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><MainLayout title="Staff & Schedule"><StaffPage /></MainLayout></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><MainLayout title="Services"><ServicesPage /></MainLayout></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><MainLayout title="Resources"><ResourcesPage /></MainLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><MainLayout title="Customers"><CustomersPage /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['owner', 'admin']}><MainLayout title="Settings"><SettingsPage /></MainLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={currentUser ? defaultAuthedPath : '/signin'} replace />} />
    </Routes>
  );
}

export default App;
