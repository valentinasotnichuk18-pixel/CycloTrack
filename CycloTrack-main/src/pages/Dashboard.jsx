import React, { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';
import { uk } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import MoodSummaryCard from '@/components/dashboard/MoodSummaryCard';
import QuickActions from '@/components/dashboard/QuickActions';
import MedicationReminders from '@/components/dashboard/MedicationReminders';
import MoodMiniChart from '@/components/dashboard/MoodMiniChart';
import MonthlyReportBanner from '@/components/dashboard/MonthlyReportBanner';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export default function Dashboard() {
  const today = format(new Date(), "EEEE, d MMMM", { locale: uk });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30);
      return data || [];
    },
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
          .from('medications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);
      return data || [];
    },
  });

  const { data: intakes = [], refetch: refetchIntakes } = useQuery({
    queryKey: ['intakes-today'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
          .from('medication_intakes')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', format(new Date(), 'yyyy-MM-dd'));
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id);
      return data || [];
    },
  });

  const queryClient = useQueryClient();
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['moodEntries'] }),
      queryClient.invalidateQueries({ queryKey: ['medications'] }),
      queryClient.invalidateQueries({ queryKey: ['intakes-today'] }),
    ]);
  }, [queryClient]);
  const { pullY, refreshing } = usePullToRefresh(handleRefresh);

  const profile = profiles[0] || null;
  const profileCompleted = profile?.is_completed;
  const latestMood = moodEntries.length > 0 ? moodEntries[0] : null;
  const firstName = profile?.full_name?.split(' ')[0] || 'Профіль';

  return (
      <div className="min-h-screen bg-background">
        <PullToRefreshIndicator pullY={pullY} refreshing={refreshing} />
        <div className="px-4 pt-12 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Циклотимія</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {today.charAt(0).toUpperCase() + today.slice(1)}
            </p>
          </div>
          <Link
              to="/profile"
              className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-2 shadow-sm active:scale-95 transition-transform"
          >
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground max-w-[80px] truncate">{firstName}</span>
          </Link>
        </div>

        <div className="px-4 pb-8 space-y-4">
          {!profileCompleted && (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Заповніть свій профіль</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Це допоможе краще відстежувати стан</p>
                </div>
                <Button size="sm" className="bg-primary shrink-0 rounded-xl" asChild>
                  <Link to="/profile">Заповнити</Link>
                </Button>
              </div>
          )}
          <MonthlyReportBanner moodEntries={moodEntries} profile={profile} />
          <MoodSummaryCard latestEntry={latestMood} />
          <MoodMiniChart entries={moodEntries} />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
              Ліки на сьогодні
            </p>
            <MedicationReminders
                medications={medications}
                intakes={intakes}
                onIntakeLogged={refetchIntakes}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
              Швидкі дії
            </p>
            <QuickActions />
          </div>
        </div>
      </div>
  );
}
