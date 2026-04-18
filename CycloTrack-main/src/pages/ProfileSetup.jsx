import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SymptomSection from '@/components/profile/SymptomSection';

const STEPS = ['Особисті дані', 'Медична інформація', 'Симптоми'];

const SYMPTOM_DATA = {
  hypomanic: {
    title: 'Гіпоманія',
    emoji: '⚡',
    color: 'bg-yellow-50 border-yellow-200',
    suggestions: [
      'Необдумані покупки', 'Підвищена балакучість', 'Майже не сплю, але повний енергії',
      'Починаю багато проєктів одночасно', 'Почуття грандіозності', 'Дуже швидко думаю',
      'Ризикована поведінка', 'Надмірне вживання алкоголю', 'Не можу зупинити думки'
    ]
  },
  depressive: {
    title: 'Депресія',
    emoji: '🌧️',
    color: 'bg-blue-50 border-blue-200',
    suggestions: [
      'Не виходжу з ліжка', 'Не їм або переїдаю', 'Плачу без причини',
      'Не відповідаю на повідомлення', 'Скасовую плани', 'Ізолююсь від людей',
      'Думки про марність існування', 'Перестаю стежити за собою'
    ]
  },
  aggressive: {
    title: 'Агресія',
    emoji: '🔥',
    color: 'bg-red-50 border-red-200',
    suggestions: [
      'Кричу на близьких', "Б'ю кулаками по стіні", 'Рву речі',
      'Кидаю предмети', 'Лаюся нецензурно', 'Дратує будь-який звук чи рух',
      'Йду хлопаючи дверима'
    ]
  },
  apathetic: {
    title: 'Апатія',
    emoji: '🪨',
    color: 'bg-gray-50 border-gray-200',
    suggestions: [
      'Нічого не хочу і нічого не роблю', 'Дивлюся в стелю годинами',
      'Не відчуваю ні радості ні суму', 'Забуваю поїсти',
      'Все здається безглуздим', 'Складно навіть встати з ліжка'
    ]
  },
};

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [form, setForm] = useState({
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
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id);
      if (profiles?.length > 0) {
        const p = profiles[0];
        setExistingId(p.id);
        setForm({
          full_name: p.full_name || '',
          gender: p.gender || '',
          age: p.age || '',
          birth_date: p.birth_date || '',
          diagnosis_date: p.diagnosis_date || '',
          last_psychiatrist_visit: p.last_psychiatrist_visit || '',
          hypomanic_symptoms: p.hypomanic_symptoms || [],
          depressive_symptoms: p.depressive_symptoms || [],
          aggressive_symptoms: p.aggressive_symptoms || [],
          apathetic_symptoms: p.apathetic_symptoms || [],
          custom_state_name: p.custom_state_name || '',
          custom_state_symptoms: p.custom_state_symptoms || [],
          is_completed: p.is_completed || false,
        });
        setIsOnboarding(!p.is_completed);
      } else {
        setIsOnboarding(true);
      }
    };
    loadProfile();
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (completed = true) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const profileData = { ...form, is_completed: completed, user_id: user.id };
    if (existingId) {
      await supabase.from('profiles').update(profileData).eq('id', existingId);
    } else {
      const { data } = await supabase.from('profiles').insert([profileData]).select();
      if (data?.[0]) setExistingId(data[0].id);
    }
    toast.success('Профіль збережено');
    setSaving(false);
    navigate('/');
  };

  const isStep0Valid = form.full_name.trim().length > 0;

  const goBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-background sticky top-0 z-10 border-b border-border">
        <button
          onClick={goBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground leading-tight">
            {isOnboarding ? 'Налаштування профілю' : 'Мій профіль'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Крок {step + 1} з {STEPS.length} — {STEPS[step]}
          </p>
        </div>
        {/* Always show home button as escape hatch */}
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          title="На головну"
        >
          <span className="text-xl">🏠</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 px-4 pt-3 pb-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-4">

        {/* STEP 0 */}
        {step === 0 && (
          <>
            <div>
              <p className="text-xl font-bold text-foreground">👤 Про вас</p>
              <p className="text-sm text-muted-foreground mt-1">Ці дані потрібні для персоналізації</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Ваше ім'я *</Label>
              <Input
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="Іваненко Марія Петрівна"
                className="mt-1.5 h-11 text-base"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Стать</Label>
              <Select value={form.gender} onValueChange={v => update('gender', v)}>
                <SelectTrigger className="mt-1.5 h-11 text-base">
                  <SelectValue placeholder="Оберіть стать" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Жіноча</SelectItem>
                  <SelectItem value="male">Чоловіча</SelectItem>
                  <SelectItem value="other">Інша / Не вказувати</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Вік</Label>
                <Input
                  type="number"
                  min={10} max={100}
                  value={form.age}
                  onChange={e => update('age', Number(e.target.value))}
                  placeholder="25"
                  className="mt-1.5 h-11 text-base"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Дата народження</Label>
                <Input
                  type="date"
                  value={form.birth_date}
                  onChange={e => update('birth_date', e.target.value)}
                  className="mt-1.5 h-11 text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div>
              <p className="text-xl font-bold text-foreground">🏥 Медична інформація</p>
              <p className="text-sm text-muted-foreground mt-1">Допомагає відстежувати динаміку</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Дата встановлення діагнозу</Label>
              <Input
                type="date"
                value={form.diagnosis_date}
                onChange={e => update('diagnosis_date', e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Остання консультація у психіатра</Label>
              <Input
                type="date"
                value={form.last_psychiatrist_visit}
                onChange={e => update('last_psychiatrist_visit', e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-xs font-semibold text-foreground mb-1">💡 Навіщо це?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Дані зберігаються тільки у вашому акаунті і допомагають відстежувати стан та нагадувати про візити до лікаря.
              </p>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div>
              <p className="text-xl font-bold text-foreground">🧠 Симптоми загострень</p>
              <p className="text-sm text-muted-foreground mt-1">
                Оберіть або додайте прояви, характерні для вас. Це допоможе розпізнавати фази раніше.
              </p>
            </div>

            {Object.entries(SYMPTOM_DATA).map(([key, data]) => (
              <SymptomSection
                key={key}
                title={data.title}
                emoji={data.emoji}
                color={data.color}
                suggestions={data.suggestions}
                value={form[`${key}_symptoms`]}
                onChange={v => update(`${key}_symptoms`, v)}
              />
            ))}

            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
              <p className="text-sm font-semibold text-foreground mb-1">✨ Свій стан</p>
              <p className="text-xs text-muted-foreground mb-3">
                Є специфічний стан, що не вкладається в стандартні категорії?
              </p>
              <Input
                value={form.custom_state_name}
                onChange={e => update('custom_state_name', e.target.value)}
                placeholder="Наприклад: Дисфорія, Панічний стан..."
                className="h-11 text-base bg-white"
              />
              {form.custom_state_name && (
                <div className="mt-3">
                  <SymptomSection
                    title={form.custom_state_name}
                    emoji="✨"
                    color="bg-transparent border-0 p-0"
                    suggestions={[]}
                    value={form.custom_state_symptoms}
                    onChange={v => update('custom_state_symptoms', v)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 pt-3 z-20" style={{paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'}}>
        {step < STEPS.length - 1 ? (
          <Button
            className="w-full h-14 text-base font-semibold bg-primary"
            onClick={() => setStep(s => s + 1)}
            disabled={step === 0 && !isStep0Valid}
          >
            Далі <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <div className="flex gap-2">
            {!isOnboarding && (
              <Button
                variant="outline"
                className="h-14 px-5 text-base"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Скасувати
              </Button>
            )}
            <Button
              className="flex-1 h-14 text-base font-semibold bg-primary"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><CheckCircle2 className="w-5 h-5 mr-2" /> {isOnboarding ? 'Зберегти і розпочати' : 'Зберегти'}</>
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
