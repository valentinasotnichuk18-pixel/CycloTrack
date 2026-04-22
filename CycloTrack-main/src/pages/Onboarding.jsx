import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ChevronRight, ChevronLeft, Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';

// Приклади симптомів для підказок
const SUGGESTIONS = {
  hypomanic: [
    'Робила необдумані покупки',
    'Почувалася невтомною, спала мало',
    'Говорила швидко і багато',
    'Брала на себе забагато задач',
    'Надмірна сексуальна активність',
    'Ризиковані фінансові рішення',
    'Відчуття особливої обдарованості',
    'Підвищена креативність і продуктивність',
    'Не могла зупинитися і відпочити',
  ],
  depressive: [
    'Не могла встати з ліжка',
    'Відмовлялася від їжі або їла дуже мало',
    'Плакала без причини',
    'Ізолювалася від людей',
    'Втрата інтересу до улюблених занять',
    'Відчуття провини та сорому',
    'Забувала про гігієну',
    'Думки про безглуздість існування',
    'Не могла зосередитися на роботі',
  ],
  aggressive: [
    'Завдавала собі фізичної шкоди',
    'Кричала на близьких',
    'Рвала або кидала речі',
    'Агресивно реагувала на дрібниці',
    'Сварилася з незнайомими людьми',
    'Не могла контролювати гнів',
    'Виходила з кімнати, хлопаючи дверима',
    'Говорила образливі речі',
  ],
  apathetic: [
    'Не відповідала на повідомлення тижнями',
    'Ігнорувала дзвінки від друзів',
    'Нічого не викликало інтересу чи радості',
    'Сиділа годинами без діяльності',
    'Не могла прийняти жодного рішення',
    'Забувала поїсти або випити воду',
    'Відмовлялася виходити з дому',
    'Почувалася емоційно порожньою',
  ],
};

const STEPS = [
  { id: 'personal', title: 'Особиста інформація', subtitle: 'Крок 1 з 3' },
  { id: 'medical', title: 'Медична інформація', subtitle: 'Крок 2 з 3' },
  { id: 'symptoms', title: 'Мої симптоми', subtitle: 'Крок 3 з 3' },
];

function SymptomsSection({ title, color, suggestions, values, onChange }) {
  const [custom, setCustom] = useState('');

  const toggle = (s) => {
    if (values.includes(s)) {
      onChange(values.filter(v => v !== s));
    } else {
      onChange([...values, s]);
    }
  };

  const addCustom = () => {
    if (custom.trim() && !values.includes(custom.trim())) {
      onChange([...values, custom.trim()]);
      setCustom('');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              values.includes(s)
                ? 'bg-primary text-white border-primary'
                : 'bg-background border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {values.filter(v => !suggestions.includes(v)).map(v => (
        <div key={v} className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs gap-1">
            {v}
            <button onClick={() => toggle(v)}><X className="w-3 h-3" /></button>
          </Badge>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          placeholder="Свій симптом..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          className="text-sm h-9"
        />
        <Button type="button" size="sm" variant="outline" onClick={addCustom} className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    full_name: '',
    gender: '',
    age: '',
    birth_date: '',
    diagnosis_date: '',
    last_psychiatrist_visit: '',
    hypomanic_symptoms: [],
    depressive_symptoms: [],
    aggressive_symptoms: [],
    apathetic_symptoms: [],
    custom_state_name: '',
    custom_state_symptoms: [],
    is_completed: false,
  });

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const handleFinish = async () => {
    if (!data.full_name) { toast.error('Введіть ваше ПІБ'); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
        .from('profiles')
        .upsert([{ ...data, is_completed: true, user_id: user.id }]);
    if (error) {
      toast.error('Помилка при збереженні');
      setSaving(false);
      return;
    }
    toast.success('Профіль збережено!');
    navigate('/');
    setSaving(false);
  };

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{currentStep.subtitle}</p>
            <h1 className="text-xl font-bold text-foreground">{currentStep.title}</h1>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 space-y-5">

        {/* Step 1: Personal */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">ПІБ *</Label>
              <Input
                className="mt-1"
                placeholder="Іваненко Марія Олексіївна"
                value={data.full_name}
                onChange={e => update('full_name', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Стать</Label>
              <Select value={data.gender} onValueChange={v => update('gender', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Оберіть стать" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Жіноча</SelectItem>
                  <SelectItem value="male">Чоловіча</SelectItem>
                  <SelectItem value="other">Інша</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Вік</Label>
                <Input
                  className="mt-1"
                  type="number"
                  placeholder="25"
                  value={data.age}
                  onChange={e => update('age', Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-xs">Дата народження</Label>
                <Input
                  className="mt-1"
                  type="date"
                  value={data.birth_date}
                  onChange={e => update('birth_date', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Medical */}
        {step === 1 && (
          <div className="space-y-4">
            <Card className="p-4 border-primary/20 bg-primary/5">
              <p className="text-xs text-muted-foreground">
                Ця інформація допоможе краще розуміти перебіг вашого стану та відстежувати динаміку.
              </p>
            </Card>
            <div>
              <Label className="text-xs">Дата встановлення діагнозу</Label>
              <Input
                className="mt-1"
                type="date"
                value={data.diagnosis_date}
                onChange={e => update('diagnosis_date', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Дата останньої консультації у психіатра</Label>
              <Input
                className="mt-1"
                type="date"
                value={data.last_psychiatrist_visit}
                onChange={e => update('last_psychiatrist_visit', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Symptoms */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="p-4 border-border bg-muted/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Оберіть або додайте симптоми, характерні <strong>особисто для вас</strong>. Це допоможе краще розпізнавати початок фаз.
              </p>
            </Card>

            <SymptomsSection
              title="🌟 Гіпоманія"
              color="text-amber-600"
              suggestions={SUGGESTIONS.hypomanic}
              values={data.hypomanic_symptoms}
              onChange={v => update('hypomanic_symptoms', v)}
            />
            <div className="border-t border-border" />
            <SymptomsSection
              title="🌧 Депресія"
              color="text-blue-600"
              suggestions={SUGGESTIONS.depressive}
              values={data.depressive_symptoms}
              onChange={v => update('depressive_symptoms', v)}
            />
            <div className="border-t border-border" />
            <SymptomsSection
              title="⚡ Агресія"
              color="text-red-600"
              suggestions={SUGGESTIONS.aggressive}
              values={data.aggressive_symptoms}
              onChange={v => update('aggressive_symptoms', v)}
            />
            <div className="border-t border-border" />
            <SymptomsSection
              title="💤 Апатія"
              color="text-slate-500"
              suggestions={SUGGESTIONS.apathetic}
              values={data.apathetic_symptoms}
              onChange={v => update('apathetic_symptoms', v)}
            />
            <div className="border-t border-border" />

            {/* Custom state */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">✏️ Мій індивідуальний стан</h3>
              <p className="text-xs text-muted-foreground">Якщо у вас є окремий стан — назвіть його та опишіть прояви.</p>
              <div>
                <Label className="text-xs">Назва стану</Label>
                <Input
                  className="mt-1"
                  placeholder="Наприклад: Дисфорія, Тривожність..."
                  value={data.custom_state_name}
                  onChange={e => update('custom_state_name', e.target.value)}
                />
              </div>
              {data.custom_state_name && (
                <SymptomsSection
                  title={`Симптоми: ${data.custom_state_name}`}
                  color="text-purple-600"
                  suggestions={[]}
                  values={data.custom_state_symptoms}
                  onChange={v => update('custom_state_symptoms', v)}
                />
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-4">
          {step > 0 && (
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Назад
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1 h-12 bg-primary hover:bg-primary/90 font-semibold" onClick={() => setStep(s => s + 1)}>
              Далі <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 bg-primary hover:bg-primary/90 font-semibold"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? 'Збереження...' : <><Check className="w-4 h-4 mr-1" /> Зберегти профіль</>}
            </Button>
          )}
        </div>

        {step === 2 && (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-center text-xs text-muted-foreground py-2"
          >
            Пропустити і заповнити пізніше
          </button>
        )}
      </div>
    </div>
  );
}
