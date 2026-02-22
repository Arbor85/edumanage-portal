import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppView } from './types';
import Layout from './components/Layout';
import RoomsView from './components/RoomsView';
import ScheduleView from './components/ScheduleView';
import EditRoomView from './components/EditRoomView';
import AddScheduleItemView from './components/AddScheduleItemView';
import FitnessActiveWorkout from './components/pages/fitnes/ActiveWorkout';
import FitnessExplore from './components/pages/fitnes/Explore';
import FitnessHistory from './components/pages/fitnes/History';
import FitnessSplitPlanner from './components/pages/fitnes/SplitPlanner';
import FitnessTrainingPlanConfirmation from './components/pages/fitnes/TrainingPlanConfirmation';
import FitnessSplitPlansList from './components/pages/fitnes/SplitPlansList';
import FitnessEditSplitPlan from './components/pages/fitnes/EditSplitPlan';
import MenteesList from './components/pages/fitnes/MenteesList';
import AcceptInvitation from './components/pages/fitnes/AcceptInvitation';
import LoginPage from './components/LoginPage';
import CallbackPage from './components/CallbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import ForbiddenPage from './components/ForbiddenPage';
import EnvSetupErrorPage from './components/EnvSetupErrorPage';
import ProfilePage from './components/ProfilePage';
import CookieConsent from './components/CookieConsent';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const getMissingEnvVars = () => {
  const requiredVars = [
    { key: 'VITE_API_BASE_URL', value: import.meta.env.VITE_API_BASE_URL },
    { key: 'VITE_API_SECURE_URL', value: import.meta.env.VITE_API_SECURE_URL },
    { key: 'VITE_PLATFORM_PORTAL_BASE_URL', value: import.meta.env.VITE_PLATFORM_PORTAL_BASE_URL },
    { key: 'VITE_PLATFORM_PORTAL_TOKEN', value: import.meta.env.VITE_PLATFORM_PORTAL_TOKEN },
    { key: 'VITE_EMERALD_BASE_URL', value: import.meta.env.VITE_EMERALD_BASE_URL },
    { key: 'VITE_PARTNER_CENTER_BASE_URL', value: import.meta.env.VITE_PARTNER_CENTER_BASE_URL }
  ];

  return requiredVars
    .filter(({ value }) => !value || String(value).trim().length === 0)
    .map(({ key }) => key);
};

// Wrapper component for routes that use Layout
const LayoutWrapper: React.FC<{ 
  children: React.ReactNode; 
  activeView: AppView; 
  title: string;
  onAddClick?: () => void;
  onNavigate?: (view: AppView) => void;
  hideHeader?: boolean;
}> = ({ children, activeView, title, onAddClick, onNavigate, hideHeader }) => {
  const handleNavigate = (view: AppView) => {
    if (onNavigate) onNavigate(view);
  };

  return (
    <Layout 
      activeView={activeView} 
      onNavigate={handleNavigate} 
      title={title}
      onAddClick={onAddClick}
      hideHeader={hideHeader}
    >
      {children}
    </Layout>
  );
};

// Wrapper for RoomsView
const RoomsViewWrapper: React.FC = () => {
  const navigate = useNavigate();
  const handleEditRoom = (roomId: string) => {
    navigate(`/rooms/${roomId}/edit`);
  };

  return (
    <LayoutWrapper activeView={AppView.ROOMS} title="ClassRooms">
      <RoomsView onEditRoom={handleEditRoom} />
    </LayoutWrapper>
  );
};

// Wrapper for EditRoomView
const EditRoomViewWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <EditRoomView 
      roomId={id || 'new'} 
      onBack={() => navigate('/rooms')}
      onSave={() => navigate('/rooms')}
    />
  );
};

// Wrapper for ScheduleView
const ScheduleViewWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.SCHEDULE} title="Weekly Schedule">
      <ScheduleView />
    </LayoutWrapper>
  );
};

// Wrapper for AddScheduleItemView
const AddScheduleItemViewWrapper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <LayoutWrapper activeView={AppView.SCHEDULE} title="Weekly Schedule">
        <ScheduleView />
      </LayoutWrapper>
      <AddScheduleItemView 
        onBack={() => navigate('/schedule')}
        onSave={() => navigate('/schedule')}
      />
    </div>
  );
};

// Wrapper for Alerts view
const AlertsViewWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.ALERTS} title="Alerts">
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <span className="material-symbols-outlined text-6xl mb-4">notifications_off</span>
        <p>No new alerts at this time.</p>
      </div>
    </LayoutWrapper>
  );
};

// Wrapper for MenteesList
const MenteesListWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.MENTEES} title="Mentees">
      <MenteesList />
    </LayoutWrapper>
  );
};

// Wrapper for Active Workout
const FitnessActiveWorkoutWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.GYM_ACTIVE_WORKOUT} title="Active Workout" hideHeader>
      <FitnessActiveWorkout />
    </LayoutWrapper>
  );
};

// Wrapper for Fitness Explore
const FitnessExploreWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.GYM_EXPLORE} title="Explore" hideHeader>
      <FitnessExplore />
    </LayoutWrapper>
  );
};

// Wrapper for Fitness History
const FitnessHistoryWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.GYM_HISTORY} title="History" hideHeader>
      <FitnessHistory />
    </LayoutWrapper>
  );
};

// Wrapper for Fitness Split Planner
const FitnessSplitPlannerWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.GYM_SPLIT_PLANNER} title="Split Planner">
      <FitnessSplitPlanner />
    </LayoutWrapper>
  );
};

const FitnessTrainingPlanConfirmationWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.GYM_SPLIT_PLANNER} title="Plan Created" hideHeader>
      <FitnessTrainingPlanConfirmation />
    </LayoutWrapper>
  );
};

const FitnessSplitPlansListWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.GYM_SPLIT_PLANS} title="Saved Plans">
      <FitnessSplitPlansList />
    </LayoutWrapper>
  );
};

const FitnessEditSplitPlanWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.GYM_EDIT_SPLIT_PLAN} title="Edit Plan">
      <FitnessEditSplitPlan />
    </LayoutWrapper>
  );
};

const ProfilePageWrapper: React.FC = () => {
  return (
    <LayoutWrapper activeView={AppView.PROFILE} title="Profile">
      <ProfilePage />
    </LayoutWrapper>
  );
};

// Component that waits for auth initialization before rendering routes
const AuthInitializer: React.FC<{ missingVars: string[]; hasMissingEnv: boolean }> = ({ missingVars, hasMissingEnv }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-300 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/setup-error" element={<EnvSetupErrorPage missingVars={missingVars} />} />
      {hasMissingEnv ? (
        <Route path="*" element={<Navigate to="/setup-error" replace />} />
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/rooms" element={<ProtectedRoute allowedRoles={['plan']}><RoomsViewWrapper /></ProtectedRoute>} />
          <Route path="/rooms/:id/edit" element={<ProtectedRoute allowedRoles={['plan']}><EditRoomViewWrapper /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute allowedRoles={['plan']}><ScheduleViewWrapper /></ProtectedRoute>} />
          <Route path="/schedule/add" element={<ProtectedRoute allowedRoles={['plan']}><AddScheduleItemViewWrapper /></ProtectedRoute>} />
          <Route path="/active-workout" element={<ProtectedRoute allowedRoles={['gym']}><FitnessActiveWorkoutWrapper /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute allowedRoles={['gym']}><FitnessExploreWrapper /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowedRoles={['gym']}><FitnessHistoryWrapper /></ProtectedRoute>} />
          <Route path="/split-plans/create" element={<ProtectedRoute allowedRoles={['gym']}><FitnessSplitPlannerWrapper /></ProtectedRoute>} />
          <Route path="/split-plans/create/confirm" element={<ProtectedRoute allowedRoles={['gym']}><FitnessTrainingPlanConfirmationWrapper /></ProtectedRoute>} />
          <Route path="/split-plans" element={<ProtectedRoute allowedRoles={['gym']}><FitnessSplitPlansListWrapper /></ProtectedRoute>} />
          <Route path="/split-plans/:id/edit" element={<ProtectedRoute allowedRoles={['gym']}><FitnessEditSplitPlanWrapper /></ProtectedRoute>} />
          <Route path="/mentees" element={<ProtectedRoute allowedRoles={['gym']}><MenteesListWrapper /></ProtectedRoute>} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="/alerts" element={<ProtectedRoute allowedRoles={['plan', 'gym', 'platform']}><AlertsViewWrapper /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['plan', 'gym', 'platform']}><ProfilePageWrapper /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  const missingEnvVars = getMissingEnvVars();
  const hasMissingEnv = missingEnvVars.length > 0;

  return (
    <AuthProvider>
      <Router>
        <AuthInitializer missingVars={missingEnvVars} hasMissingEnv={hasMissingEnv} />
      </Router>
      <CookieConsent />
    </AuthProvider>
  );
};

export default App;
