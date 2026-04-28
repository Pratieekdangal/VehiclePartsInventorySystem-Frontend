import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, FileText, BarChart3, Bell,
  ShoppingCart, Calendar, Receipt, UserCircle,
  Package, Truck,
  Users, Inbox, Star, Car, History,
} from 'lucide-react';

import { useAuth, homePathFor } from './store/auth';
import AppShell from './components/layout/AppShell';
import MobileShell from './components/layout/MobileShell';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminPurchases from './pages/admin/Purchases';
import AdminReports from './pages/admin/Reports';
import AdminParts from './pages/admin/Parts';
import AdminVendors from './pages/admin/Vendors';
import AdminStaff from './pages/admin/Staff';
import AdminAppointments from './pages/admin/Appointments';
import AdminPartRequests from './pages/admin/PartRequests';

import StaffDashboard from './pages/staff/Dashboard';
import NewSale from './pages/staff/NewSale';
import StaffSales from './pages/staff/Sales';

import CustomerHome from './pages/customer/Home';
import CustomerProfile from './pages/customer/Profile';
import CustomerBookService from './pages/customer/BookService';
import CustomerHistory from './pages/customer/History';
import CustomerReviews from './pages/customer/Reviews';
import CustomerPartRequests from './pages/customer/PartRequests';

import NotificationsPage from './pages/Notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
});

// Per-role nav arrays. Teammates will extend these when they push their
// pages — add their import + nav entry + matching <Route /> below.
const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/parts', label: 'Parts inventory', icon: Package },
  { to: '/admin/vendors', label: 'Vendors', icon: Truck },
  { to: '/admin/purchases', label: 'Purchase invoices', icon: FileText },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { to: '/admin/part-requests', label: 'Part requests', icon: Inbox },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
];

const staffNav = [
  { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/staff/new-sale', label: 'New sale', icon: ShoppingCart },
  { to: '/staff/sales', label: 'All sales', icon: Receipt },
  { to: '/staff/notifications', label: 'Notifications', icon: Bell },
];

// Customer mobile bottom-tab order per design system: Home · Service · History · Reviews · Profile.
const customerTabs = [
  { to: '/customer', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/customer/book', label: 'Service', icon: Calendar },
  { to: '/customer/history', label: 'History', icon: Receipt },
  { to: '/customer/reviews', label: 'Reviews', icon: Star },
  { to: '/customer/profile', label: 'Profile', icon: UserCircle },
];

function HomeRedirect() {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathFor(user.role)} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: '"Inter", system-ui, sans-serif', fontSize: 13 },
          }}
        />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin shell */}
          <Route
            element={
              <ProtectedRoute allow={['Admin']}>
                <AppShell
                  navItems={adminNav}
                  sectionLabel="Admin"
                  notificationsTo="/admin/notifications"
                />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/parts" element={<AdminParts />} />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route path="/admin/purchases" element={<AdminPurchases />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/part-requests" element={<AdminPartRequests />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Staff shell */}
          <Route
            element={
              <ProtectedRoute allow={['Staff', 'Admin']}>
                <AppShell
                  navItems={staffNav}
                  sectionLabel="Counter"
                  notificationsTo="/staff/notifications"
                />
              </ProtectedRoute>
            }
          >
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/new-sale" element={<NewSale />} />
            <Route path="/staff/sales" element={<StaffSales />} />
            <Route path="/staff/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Customer mobile shell */}
          <Route
            element={
              <ProtectedRoute allow={['Customer']}>
                <MobileShell
                  tabs={customerTabs}
                  notificationsTo="/customer/notifications"
                />
              </ProtectedRoute>
            }
          >
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/customer/book" element={<CustomerBookService />} />
            <Route path="/customer/history" element={<CustomerHistory />} />
            <Route path="/customer/reviews" element={<CustomerReviews />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/requests" element={<CustomerPartRequests />} />
            <Route path="/customer/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
