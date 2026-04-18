import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import MoodSlider from '@/components/mood/MoodSlider';
import SymptomPicker from '@/components/mood/SymptomPicker';
import MenstrualSync from '@/components/mood/MenstrualSync';
import EmotionalStatePicker from '@/components/mood/EmotionalStatePicker';
import { EMOTIONAL_CATEGORIES, getStateById } from '@/lib/emotionalStates';

const phaseOptions = [
  { value: 'hypomanic', label: 'Гіпоманія' },
  { value: 'depressive', label: 'Депресія' },
  { value: 'aggressive', label: 'Агресія' },
  { value: 'anxious', label: 'Тривога' },
  { value: 'dysphoric', label: 'Дисфорія' },
  { value: 'apathetic', label: 'Апатія' },
  { value: 'mixed', label: 'Змішана' },
  { value: 'stable', label: 'Стабільний' },
];

export default function NewMoodEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [entry, setEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood_level: 0,
    phase: 'stable',
    emotional_state: '',
    emotional_category: 'neutral',
    energy_level: 5,
    sleep_hours: 7,
    anxiety_level: 3,
    irritability: 3,
    notes: '',
    symptoms: [],
    menstrual_day: null,
    menstrual_phase: 'none',
  });

  const update = (field, value) => setEntry(prev => ({ ...prev, [field]: value }));

  const { mutate: saveEntry, isPending: saving } = useMutation({
    mutationFn: async (data) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
          .from('mood_entries')
          .insert([{ ...data, user_id: user.id }])
      if (error) throw error
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['moodEntries'] });
      const previous = queryClient.getQueryData(['moodEntries']);
      queryClient.setQueryData(['moodEntries'], (old = []) => [
        { ...data, id: `optimistic-${Date.now()}` },
        ...old,
      ]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['moodEntries'], ctx.previous);
      toast.error('Помилка при збереженні');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodEntries'] });
      toast.success('Запис настрою успішно додано');
      navigate('/mood');
    },
  });

  const handleSave = () => {
    const data = { ...entry };
    if (data.menstrual_phase === 'none') {
      delete data.menstrual_day;
      delete data.menstrual_phase;
    }
    saveEntry(data);
  };

  return (
    <div>
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Новий запис</h1>
      </div>

      <div className="px-5 space-y-5 pb-8">
        <div>
          <Label className="text-xs">Дата</Label>
          <Input
            type="date"
            value={entry.date}
            onChange={(e) => update('date', e.target.value)}
            className="mt-1"
          />
        </div>

        <MoodSlider value={entry.mood_level} onChange={(v) => update('mood_level', v)} />

        {/* Емоційний стан — основний дропдаун */}
        <EmotionalStatePicker
          value={entry.emotional_state}
          onChange={(stateId) => {
            const state = getStateById(stateId);
            if (state) {
              const cat = EMOTIONAL_CATEGORIES[state.category];
              update('emotional_state', stateId);
              update('emotional_category', state.category);
              // Автоматично встановлюємо фазу та рівень настрою
              update('phase', cat.phase);
              update('mood_level', state.moodLevel);
              // Автоматично додаємо типові симптоми
              if (state.symptoms?.length > 0) {
                update('symptoms', state.symptoms);
              }
            } else {
              update('emotional_state', stateId);
            }
          }}
        />

        <div>
          <Label className="text-xs">Фаза циклотимії (уточнення)</Label>
          <Select value={entry.phase} onValueChange={(v) => update('phase', v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {phaseOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Енергія: {entry.energy_level}/10</Label>
            <Slider
              min={1} max={10} step={1}
              value={[entry.energy_level]}
              onValueChange={([v]) => update('energy_level', v)}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs">Сон: {entry.sleep_hours} год</Label>
            <Slider
              min={0} max={16} step={0.5}
              value={[entry.sleep_hours]}
              onValueChange={([v]) => update('sleep_hours', v)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Тривожність: {entry.anxiety_level}/10</Label>
            <Slider
              min={1} max={10} step={1}
              value={[entry.anxiety_level]}
              onValueChange={([v]) => update('anxiety_level', v)}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs">Дратівливість: {entry.irritability}/10</Label>
            <Slider
              min={1} max={10} step={1}
              value={[entry.irritability]}
              onValueChange={([v]) => update('irritability', v)}
              className="mt-2"
            />
          </div>
        </div>

        <SymptomPicker
          selected={entry.symptoms}
          onChange={(v) => update('symptoms', v)}
          phase={entry.phase}
        />

        <MenstrualSync
          day={entry.menstrual_day}
          phase={entry.menstrual_phase}
          onDayChange={(v) => update('menstrual_day', v)}
          onPhaseChange={(v) => update('menstrual_phase', v)}
        />

        <div>
          <Label className="text-xs">Нотатки</Label>
          <Textarea
            value={entry.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Як пройшов день? Що вплинуло на настрій?"
            className="mt-1 h-20"
          />
        </div>

        <Button
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Збереження...' : 'Зберегти запис'}
        </Button>
      </div>
    </div>
  );
}
