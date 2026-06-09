import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Onboarding from './pages/onboarding/Onboarding';

// Main pages
import Home from './pages/home/Home';
import QuestList from './pages/quest/QuestList';
import QuestDetail from './pages/quest-detail/QuestDetail';
import Academy from './pages/academy/Academy';
import Listing from './pages/listing/Listing';
import Prospect from './pages/prospect/Prospect';
import Profile from './pages/profile/Profile';
import Badges from './pages/badges/Badges';
import Leaderboard from './pages/leaderboard/Leaderboard';
import HallOfFame from './pages/hall-of-fame/HallOfFame';
import Support from './pages/support/Support';
import Poster from './pages/poster/Poster';
import LevelGuide from './pages/level-guide/LevelGuide';
import Chat from './pages/chat/Chat';
import Notifications from './pages/notifications/Notifications';
import Activities from './pages/activities/Activities';
import Settings from './pages/settings/Settings';
import SearchPage from './pages/search/SearchPage';
import AgentDetail from './pages/agent-detail/AgentDetail';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-700 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-700 border-t-transparent rounded-full animate-spin" /></div>;
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/quest" element={<QuestList />} />
        <Route path="/quest/:id" element={<QuestDetail />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/prospect" element={<Prospect />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/hall-of-fame" element={<HallOfFame />} />
        <Route path="/support" element={<Support />} />
        <Route path="/poster" element={<Poster />} />
        <Route path="/level-guide" element={<LevelGuide />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/agent/:id" element={<AgentDetail />} />
      </Route>

      {/* Redirect & 404 */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
