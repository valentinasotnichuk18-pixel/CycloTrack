import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';

const menstrualLabels = {
  menstruation: 'Менструація',
  follicular: 'Фолікулярна',
  ovulation: 'Овуляція',
  luteal: 'Лютеїнова',
};

const menstrualColors = {
  menstruation: 'bg-red-100 text-red-700',
  follicular: 'bg-green-100 text-green-700',
  ovulation: 'bg-purple-100 text-purple-700',
  luteal: 'bg-yellow-100 text-yellow-700',
};

export default function MenstrualCycle() {
  const navigate = useNavigate();

  const { data: entries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(60);
      return data || [];
    },
  });

  const cycleEntries = entries.filter(e => e.menstrual_phase && e.menstrual_phase !== 'none');

  // Calculate average mood per menstrual phase
  const phaseStats = Object.keys(menstrualLabels).map(phase => {
    const phaseEntries = cycleEntries.filter(e => e.menstrual_phase === phase);
    const avgMood = phaseEntries.length > 0
      ? (phaseEntries.reduce((s, e) => s + e.mood_level, 0) / phaseEntries.length).toFixed(1)
      : null;
    const avgEnergy = phaseEntries.length > 0
      ? (phaseEntries.reduce((s, e) => s + (e.energy_level || 0), 0) / phaseEntries.length).toFixed(1)
      : null;
    return { phase, label: menstrualLabels[phase], avgMood, avgEnergy, count: phaseEntries.length };
  });

  const chartData = [...cycleEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map(e => ({
      date: format(parseISO(e.date), 'd.MM', { locale: uk }),
      mood: e.mood_level,
      day: e.menstrual_day,
    }));

  return (
    <div>
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Менструальний цикл</h1>
          <p className="text-xs text-muted-foreground">Порівняння з фазами циклотимії</p>
        </div>
      </div>

      <div className="px-5 space-y-5 pb-8">
        <Card className="p-4 border-0 bg-pink-50/60">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-semibold">Синхронізація циклу</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Відстежуйте настрій разом з днем менструального циклу при створенні запису. 
            Додаток покаже кореляцію між гормональними змінами та фазами циклотимії.
          </p>
        </Card>

        {/* Phase stats */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Середній настрій за фазами циклу
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {phaseStats.map(({ phase, label, avgMood, avgEnergy, count }) => (
              <Card key={phase} className="p-3 border border-border">
                <Badge className={`text-[10px] ${menstrualColors[phase]} mb-2`}>{label}</Badge>
                {avgMood !== null ? (
                  <div>
                    <p className="text-lg font-bold">
                      {Number(avgMood) > 0 ? '+' : ''}{avgMood}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Енергія: {avgEnergy} · {count} записів
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Немає даних</p>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Chart */}
        {chartData.length >= 2 && (
          <Card className="p-4 border-0 bg-card">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Настрій протягом циклу
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[-5, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <ReferenceLine y={0} stroke="hsl(220, 15%, 88%)" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="mood" stroke="#ec4899" fill="url(#cycleGrad)" strokeWidth={2} dot={{ r: 3, fill: '#ec4899' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Recent entries with cycle data */}
        {cycleEntries.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Останні записи з даними циклу
            </h2>
            <div className="space-y-2">
              {cycleEntries.slice(0, 10).map(e => (
                <Card key={e.id} className="p-3 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(e.date), 'd MMMM', { locale: uk })} · День {e.menstrual_day || '—'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold">
                          {e.mood_level > 0 ? `+${e.mood_level}` : e.mood_level}
                        </span>
                        <Badge className={`text-[10px] ${menstrualColors[e.menstrual_phase]}`}>
                          {menstrualLabels[e.menstrual_phase]}
                        </Badge>
                      </div>
                    </div>
                    {e.mood_level > 0 ? <TrendingUp className="w-4 h-4 text-amber-500" /> :
                     e.mood_level < 0 ? <TrendingDown className="w-4 h-4 text-blue-500" /> :
                     <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
