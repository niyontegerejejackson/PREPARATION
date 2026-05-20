import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';

// Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ManageRooms from './pages/Admin/ManageRooms';
import ManageBookings from './pages/Admin/ManageBookings';
import AdminReports from './pages/Admin/Reports';
import ManagePayments from './pages/Admin/ManagePayments';
import Notifications from './pages/Admin/Notifications';
import AuditLogs from './pages/Admin/AuditLogs';
import Settings from './pages/Admin/Settings';

// Client Pages
import ClientDashboard from './pages/Client/Dashboard';
import RoomSearch from './pages/Client/RoomSearch';
import MyBookings from './pages/Client/MyBookings';
import Profile from './pages/Client/Profile';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/client/dashboard'} replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (user) {
    return <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/client/dashboard'} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/forgotpassword" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/resetpassword/:token" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="Admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="payments" element={<ManagePayments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Client Routes */}
        <Route path="/client" element={
          <ProtectedRoute roleRequired="Client">
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="rooms" element={<RoomSearch />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
