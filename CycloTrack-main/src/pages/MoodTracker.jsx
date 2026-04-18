import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';
import React, { useCallback, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Activity, Heart, Search, X } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import MoodMiniChart from '@/components/dashboard/MoodMiniChart';
import { getStateById } from '@/lib/emotionalStates';

const phaseLabels = {
  hypomanic: 'Гіпоманія',
  depressive: 'Депресія',
  aggressive: 'Агресія',
  anxious: 'Тривога',
  dysphoric: 'Дисфорія',
  apathetic: 'Апатія',
  mixed: 'Змішана',
  stable: 'Стабільний',
};

const phaseColors = {
  hypomanic: 'bg-amber-100 text-amber-700',
  depressive: 'bg-blue-100 text-blue-700',
  aggressive: 'bg-red-100 text-red-700',
  anxious: 'bg-orange-100 text-orange-700',
  dysphoric: 'bg-purple-100 text-purple-700',
  apathetic: 'bg-slate-100 text-slate-600',
  mixed: 'bg-purple-100 text-purple-700',
  stable: 'bg-emerald-100 text-emerald-700',
};

const menstrualLabels = {
  menstruation: 'Менструація',
  follicular: 'Фолікулярна',
  ovulation: 'Овуляція',
  luteal: 'Лютеїнова',
};

export default function MoodTracker() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeSymptom, setActiveSymptom] = useState('');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(100)
      if (error) throw error
      return data || []
    },
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
  }, [queryClient]);
  const { pullY, refreshing } = usePullToRefresh(handleRefresh);

  // collect all unique symptoms from entries for quick-filter chips
  const allSymptoms = useMemo(() => {
    const set = new Set();
    entries.forEach(e => e.symptoms?.forEach(s => set.add(s)));
    return [...set].slice(0, 12);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter(e => {
      const matchesText = !q ||
        e.notes?.toLowerCase().includes(q) ||
        e.symptoms?.some(s => s.toLowerCase().includes(q)) ||
        phaseLabels[e.phase]?.toLowerCase().includes(q);
      const matchesSymptom = !activeSymptom || e.symptoms?.includes(activeSymptom);
      return matchesText && matchesSymptom;
    });
  }, [entries, search, activeSymptom]);

  const hasFilter = search.trim() || activeSymptom;

  return (
    <div>
      <PullToRefreshIndicator pullY={pullY} refreshing={refreshing} />
      <PageHeader
        title="Відстеження настрою"
        subtitle="Записи вашого стану"
        action={
          <div className="flex gap-2">
            <Link to="/mood/cycle">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-1 text-pink-500" />
                Цикл
              </Button>
            </Link>
            <Link to="/mood/new">
              <Button size="sm" className="bg-primary">
                <Plus className="w-4 h-4 mr-1" />
                Новий
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-5 space-y-4">
        <MoodMiniChart entries={entries} />

        {/* Search bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук за нотатками або симптомами…"
              className="pl-9 pr-9 rounded-xl bg-card border-border"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Symptom chips */}
          {allSymptoms.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {allSymptoms.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveSymptom(prev => prev === s ? '' : s)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    activeSymptom === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Results count */}
          {hasFilter && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Знайдено: <span className="font-semibold text-foreground">{filteredEntries.length}</span> із {entries.length}
              </p>
              <button
                onClick={() => { setSearch(''); setActiveSymptom(''); }}
                className="text-xs text-primary"
              >
                Скинути
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Немає записів"
            description="Почніть відстежувати настрій, щоб бачити патерни циклотимії"
            action={
              <Link to="/mood/new">
                <Button className="bg-primary">Додати перший запис</Button>
              </Link>
            }
          />
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">Нічого не знайдено</p>
            <button onClick={() => { setSearch(''); setActiveSymptom(''); }} className="text-xs text-primary mt-1">
              Скинути фільтр
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map(entry => (
              <Card key={entry.id} className="p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(entry.date), 'd MMMM yyyy', { locale: uk })}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {entry.emotional_state && (
                        <span className="text-lg">{getStateById(entry.emotional_state)?.emoji}</span>
                      )}
                      <span className="text-xl font-bold">
                        {entry.mood_level > 0 ? `+${entry.mood_level}` : entry.mood_level}
                      </span>
                      <Badge className={`text-xs ${phaseColors[entry.phase] || 'bg-slate-100 text-slate-600'}`}>
                        {phaseLabels[entry.phase] || entry.phase}
                      </Badge>
                      {entry.emotional_state && getStateById(entry.emotional_state) && (
                        <span className="text-xs text-muted-foreground">
                          {getStateById(entry.emotional_state).label}
                        </span>
                      )}
                      {entry.menstrual_phase && entry.menstrual_phase !== 'none' && (
                        <Badge className="text-xs bg-pink-100 text-pink-700">
                          <Heart className="w-3 h-3 mr-1" />
                          {menstrualLabels[entry.menstrual_phase]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Енергія: {entry.energy_level}/10</span>
                      <span>Сон: {entry.sleep_hours}г</span>
                    </div>
                  </div>
                </div>
                {entry.symptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.symptoms.slice(0, 3).map(s => (
                      <Badge key={s} variant="outline" className="text-[10px] py-0">{s}</Badge>
                    ))}
                    {entry.symptoms.length > 3 && (
                      <Badge variant="outline" className="text-[10px] py-0">+{entry.symptoms.length - 3}</Badge>
                    )}
                  </div>
                )}
                {entry.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{entry.notes}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
