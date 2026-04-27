import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  FileText,
  BarChart3,
  Bell,
  Receipt,
  ShoppingCart,
  Calendar,
  Inbox,
  Star,
  Car,
  History,
} from 'lucide-react';

import { useAuth, homePathFor } from './store/auth';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';
import NewSale from './pages/staff/NewSale';
import CustomerHome from './pages/customer/Home';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
});

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/parts', label: 'Parts inventory', icon: Package },
  { to: '/admin/vendors', label: 'Vendors', icon: Truck },
  { to: '/admin/purchases', label: 'Purchase invoices', icon: FileText },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
];

const staffNav = [
  { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/staff/new-sale', label: 'New sale', icon: ShoppingCart },
  { to: '/staff/sales', label: 'All sales', icon: Receipt },
  { to: '/staff/customers', label: 'Customers', icon: Users },
  { to: '/staff/reports', label: 'Reports', icon: BarChart3 },
  { to: '/staff/notifications', label: 'Notifications', icon: Bell },
];

const customerNav = [
  { to: '/customer', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/customer/book', label: 'Book service', icon: Calendar },
  { to: '/customer/history', label: 'Purchase history', icon: History },
  { to: '/customer/requests', label: 'Part requests', icon: Inbox },
  { to: '/customer/reviews', label: 'Reviews', icon: Star },
  { to: '/customer/profile', label: 'Profile & vehicles', icon: Car },
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
            {/* Other admin routes will land here as they ship */}
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
          </Route>

          {/* Customer shell (mobile-first; using same shell for now) */}
          <Route
            element={
              <ProtectedRoute allow={['Customer']}>
                <AppShell
                  navItems={customerNav}
                  sectionLabel="Service"
                  notificationsTo="/customer/notifications"
                />
              </ProtectedRoute>
            }
          >
            <Route path="/customer" element={<CustomerHome />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
