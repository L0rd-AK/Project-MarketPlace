import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

// Buyer Pages
import BuyerDashboard from './pages/BuyerDashboard';
import BuyerProjectDetail from './pages/BuyerProjectDetail';

// Solver Pages
import SolverDashboard from './pages/SolverDashboard';
import SolverProjectDetail from './pages/SolverProjectDetail';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/solver" replace /> : <Register />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Buyer Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/projects/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
            <BuyerProjectDetail />
          </ProtectedRoute>
        }
      />

      {/* Solver Routes */}
      <Route
        path="/solver"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SOLVER]}>
            <SolverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solver/projects/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SOLVER]}>
            <SolverProjectDetail />
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role.toLowerCase()}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
