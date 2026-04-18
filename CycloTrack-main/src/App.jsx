import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useMedicationReminders from '@/hooks/useMedicationReminders';
import { supabase } from '@/lib/supabaseClient'
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import MoodTracker from '@/pages/MoodTracker';
import NewMoodEntry from '@/pages/NewMoodEntry';
import MenstrualCycle from '@/pages/MenstrualCycle';
import Medications from '@/pages/Medications';
import AddMedicationPage from '@/pages/AddMedicationPage';
import Prescriptions from '@/pages/Prescriptions';
import NewPrescription from '@/pages/NewPrescription';
import Settings from '@/pages/Settings';
import ProfileSetup from '@/pages/ProfileSetup';
import Login from '@/pages/Login';

function ProfileGuard() {
  const [checking, setChecking] = useState(true);
  const [profileDone, setProfileDone] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setChecking(false); return; }
      const { data } = await supabase
          .from('profiles')
          .select('is_completed')
          .eq('user_id', user.id);
      setProfileDone(data?.length > 0 && data[0].is_completed);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  if (checking) return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
  );

  return profileDone ? <Navigate to="/" replace /> : <Navigate to="/profile" replace />;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  useMedicationReminders();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/profile" element={<PageSlide><ProfileSetup /></PageSlide>} />
          <Route path="/onboarding" element={<ProfileGuard />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<PageSlide><Dashboard /></PageSlide>} />
            <Route path="/mood" element={<PageSlide><MoodTracker /></PageSlide>} />
            <Route path="/mood/new" element={<PageSlide><NewMoodEntry /></PageSlide>} />
            <Route path="/mood/cycle" element={<PageSlide><MenstrualCycle /></PageSlide>} />
            <Route path="/medications" element={<PageSlide><Medications /></PageSlide>} />
            <Route path="/medications/new" element={<PageSlide><AddMedicationPage /></PageSlide>} />
            <Route path="/prescriptions" element={<PageSlide><Prescriptions /></PageSlide>} />
            <Route path="/prescriptions/new" element={<PageSlide><NewPrescription /></PageSlide>} />
            <Route path="/settings" element={<PageSlide><Settings /></PageSlide>} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AnimatePresence>
  );
};

function PageSlide({ children }) {
  return (
      <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
  );
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
  )

  if (!session) return <Login />

  return (
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </QueryClientProvider>
      </AuthProvider>
  )
}

export default App