import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Pill, FileText, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

const baseActions = [
  { path: '/mood/new', icon: Activity, label: 'Записати настрій', color: 'bg-primary/10 text-primary' },
  { path: '/medications', icon: Pill, label: 'Ліки', color: 'bg-accent/10 text-accent' },
  { path: '/prescriptions/new', icon: FileText, label: 'Додати рецепт', color: 'bg-emerald-50 text-emerald-600' },
  { path: '/mood/cycle', icon: Heart, label: 'Менструальний цикл', color: 'bg-pink-50 text-pink-500', femaleOnly: true },
];

export default function QuickActions() {
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

  const gender = profiles[0]?.gender;
  const actions = baseActions.filter(a => !a.femaleOnly || gender !== 'male');

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ path, icon: Icon, label, color }) => (
        <Link
          key={path}
          to={path}
          className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border active:scale-95 transition-transform"
        >
          <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-foreground leading-tight">{label}</span>
        </Link>
      ))}
    </div>
  );
}
