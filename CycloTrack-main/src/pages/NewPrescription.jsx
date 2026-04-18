import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TYPE_OPTIONS = [
  { value: 'prescription', label: 'Рецепт' },
  { value: 'recommendation', label: 'Рекомендація' },
  { value: 'referral', label: 'Направлення' },
  { value: 'analysis', label: 'Аналіз' },
];

export default function NewPrescription() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '', doctor_name: '', date: '', type: 'prescription',
    description: '', file_url: '', is_active: true,
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage
          .from('prescriptions')
          .getPublicUrl(fileName)
      update('file_url', publicUrl)
      toast({ title: 'Файл завантажено' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title) {
      toast({ title: 'Помилка', description: 'Введіть назву', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
        .from('prescriptions')
        .insert([{ ...form, user_id: user.id }])
    if (error) {
      toast({ title: 'Помилка', description: error.message, variant: 'destructive' })
      setSaving(false)
      return
    }
    toast({ title: 'Збережено', description: 'Рецепт успішно додано' });
    navigate('/prescriptions');
    setSaving(false);
  };

  return (
    <div>
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Новий рецепт</h1>
      </div>

      <div className="px-5 space-y-4 pb-8">
        <div>
          <Label className="text-xs">Тип документа</Label>
          <Select value={form.type} onValueChange={v => update('type', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Назва *</Label>
          <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="напр. Рецепт на Ламотриджин" className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Лікар</Label>
            <Input value={form.doctor_name} onChange={e => update('doctor_name', e.target.value)} placeholder="Ім'я лікаря" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Дата</Label>
            <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label className="text-xs">Опис / Рекомендації</Label>
          <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Детальний опис рецепту або рекомендації лікаря" className="mt-1 h-28" />
        </div>

        <div>
          <Label className="text-xs">Фото або скан документа</Label>
          <div className="mt-1">
            {form.file_url ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                <span className="text-xs text-emerald-700 flex-1">Файл завантажено</span>
                <Button variant="ghost" size="sm" onClick={() => update('file_url', '')}>Видалити</Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Завантаження...' : 'Натисніть для завантаження'}
                </span>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Актуальний</Label>
          <Switch checked={form.is_active} onCheckedChange={v => update('is_active', v)} />
        </div>

        <Button className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Збереження...' : 'Зберегти'}
        </Button>
      </div>
    </div>
  );
}
