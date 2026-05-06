import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from './components/PageTransition';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Splash } from './screens/Splash';
import { Welcome } from './screens/Welcome';
import { Register } from './screens/Register';
import { Login } from './screens/Login';
import { ForgotPassword } from './screens/ForgotPassword';
import { ResetPassword } from './screens/ResetPassword';

import { Home } from './screens/user/Home';
import { Search } from './screens/user/Search';
import { Favorites } from './screens/user/Favorites';
import { Profile } from './screens/user/Profile';
import { StopDetails } from './screens/user/StopDetails';
import { About } from './screens/user/About';
import { Privacy } from './screens/user/Privacy';
import { Terms } from './screens/user/Terms';
import { Contact } from './screens/user/Contact';
import { EditProfile } from './screens/user/EditProfile';
import { Notifications } from './screens/user/Notifications';
import { LineDetails } from './screens/user/LineDetails';

import { Dashboard } from './screens/admin/Dashboard';
import { ManageStops } from './screens/admin/ManageStops';
import { ManageLines } from './screens/admin/ManageLines';
import { ManageUsers } from './screens/admin/ManageUsers';
import { ManageNotifications } from './screens/admin/ManageNotifications';
import { AdminProfile } from './screens/admin/AdminProfile';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/user/home" replace />;
  }

  return <>{children}</>;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Splash /></PageTransition>} />
        <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        <Route path="/user/home" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/user/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/user/favorites" element={<PageTransition><Favorites /></PageTransition>} />
        <Route path="/user/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/user/stop/:id" element={<PageTransition><StopDetails /></PageTransition>} />
        <Route path="/user/line/:id" element={<PageTransition><LineDetails /></PageTransition>} />
        <Route path="/user/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/user/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/user/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/user/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/user/edit-profile" element={<PageTransition><EditProfile /></PageTransition>} />
        <Route path="/user/notifications" element={<PageTransition><Notifications /></PageTransition>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/stops" element={<ProtectedRoute adminOnly><PageTransition><ManageStops /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/lines" element={<ProtectedRoute adminOnly><PageTransition><ManageLines /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><PageTransition><ManageUsers /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><PageTransition><ManageNotifications /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute adminOnly><PageTransition><AdminProfile /></PageTransition></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="w-full h-screen max-w-[390px] mx-auto bg-background shadow-2xl overflow-hidden relative flex flex-col transition-colors duration-300">
            <AnimatedRoutes />
          </div>

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#2E7D32',
              color: 'white',
              borderRadius: '50px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500'
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}