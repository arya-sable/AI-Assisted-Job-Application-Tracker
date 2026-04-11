import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardPage from './pages/BoardPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 } },
});

function ThemedToaster() {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'theme-transition',
        style: {
          borderRadius: '12px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#e2e8f0' : '#0f172a',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        },
        success: {
          iconTheme: {
            primary: '#0d9488',
            secondary: isDark ? '#1e293b' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: isDark ? '#1e293b' : '#ffffff',
          },
        },
      }}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/board"
                element={<ProtectedRoute><BoardPage /></ProtectedRoute>}
              />
              <Route
                path="/applications/:id"
                element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>}
              />
            </Routes>
          </BrowserRouter>
          <ThemedToaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
