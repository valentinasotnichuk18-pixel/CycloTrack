import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
 
const FREQ_OPTIONS = [
  { value: 'once_daily', label: '1 раз на день' },
  { value: 'twice_daily', label: '2 рази на день' },
  { value: 'three_daily', label: '3 рази на день' },
  { value: 'as_needed', label: 'За потребою' },
  { value: 'weekly', label: 'Щотижня' },
];
 
export default function AddMedicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', dosage: '', frequency: 'once_daily',
    times: ['08:00'], start_date: '', notes: '', side_effects: '', is_active: true,
  });
 
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const addTime = () => update('times', [...form.times, '12:00']);
  const removeTime = (i) => update('times', form.times.filter((_, idx) => idx !== i));
  const updateTime = (i, val) => {
    const times = [...form.times];
    times[i] = val;
    update('times', times);
  };

  const handleSave = async () => {
    if (!form.name || !form.dosage) {
      toast.error('Введіть назву та дозування');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
        .from('medications')
        .insert([{ ...form, user_id: user.id }])
    if (error) {
      toast.error('Помилка при збереженні')
      setSaving(false)
      return
    }
    queryClient.invalidateQueries({ queryKey: ['medications'] });
    toast.success(`${form.name} додано до списку ліків`);
    navigate('/medications');
  };
 
  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Додати ліки</h1>
      </div>
 
      {/* Form */}
      <div className="px-5 space-y-4 pb-8">
        <div>
          <Label className="text-xs">Назва ліків *</Label>
          <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="напр. Ламотриджин" className="mt-1" />
        </div>
 
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Дозування *</Label>
            <Input value={form.dosage} onChange={e => update('dosage', e.target.value)} placeholder="напр. 100мг" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Частота</Label>
            <Select value={form.frequency} onValueChange={v => update('frequency', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQ_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
 
        <div>
          <Label className="text-xs">Час прийому</Label>
          <div className="space-y-2 mt-1">
            {form.times.map((time, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input type="time" value={time} onChange={e => updateTime(i, e.target.value)} className="flex-1" />
                {form.times.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeTime(i)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addTime} className="w-full">
              <Plus className="w-4 h-4 mr-1" /> Додати час
            </Button>
          </div>
        </div>
 
        <div>
          <Label className="text-xs">Дата початку</Label>
          <Input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="mt-1" />
        </div>
 
        <div>
          <Label className="text-xs">Побічні ефекти</Label>
          <Textarea value={form.side_effects} onChange={e => update('side_effects', e.target.value)} placeholder="Відомі побічні ефекти" className="mt-1 h-16" />
        </div>
 
        <div>
          <Label className="text-xs">Нотатки</Label>
          <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Додаткова інформація" className="mt-1 h-16" />
        </div>
 
        <Button
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Збереження...' : 'Зберегти ліки'}
        </Button>
      </div>
    </div>
  );
}
