import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import { Link } from 'react-router-dom';
import {
  Moon, Volume2, RefreshCw, Download, Upload, User, LogOut,
  ChevronRight, Smartphone, Bell, Trash2
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SETTINGS_KEY = 'cyclothymia_settings';

const systemDark = false;

const defaultSettings = {
  darkMode: systemDark,
  soundEnabled: true,
  notifications: true,
  googleSync: false,
  compactView: false,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applyDarkMode(enabled) {
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [user, setUser] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user)).catch(() => {});
  }, []);

  useEffect(() => {
    applyDarkMode(settings.darkMode);
    saveSettings(settings);
  }, [settings]);

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const fetchAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const [
      { data: moods },
      { data: medications },
      { data: prescriptions }
    ] = await Promise.all([
      supabase.from('mood_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(500),
      supabase.from('medications').select('*').eq('user_id', user.id).limit(200),
      supabase.from('prescriptions').select('*').eq('user_id', user.id).limit(200),
    ])
    return { moods: moods || [], medications: medications || [], intakes: [], prescriptions: prescriptions || [] }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const data = await fetchAllData();
      const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `cyclothymia_${new Date().toISOString().split('T')[0]}.json`);
      toast.success('Експортовано у JSON');
    } catch { toast.error('Помилка при експорті'); }
    setExporting(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { moods, medications } = await fetchAllData();
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const dateStr = new Date().toLocaleDateString('uk-UA');
      let y = 20;

      doc.setFontSize(16);
      doc.text('CycloTrack — Звіт про стан', 105, y, { align: 'center' });
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Дата: ${dateStr}`, 105, y, { align: 'center' });
      doc.setTextColor(0);
      y += 12;

      doc.setFontSize(13);
      doc.text('Записи настрою', 14, y);
      y += 7;
      doc.setFontSize(9);

      const phaseLabels = { hypomanic:'Гіпоманія', depressive:'Депресія', aggressive:'Агресія', anxious:'Тривога', dysphoric:'Дисфорія', apathetic:'Апатія', mixed:'Змішана', stable:'Стабільний' };

      for (const m of moods.slice(0, 100)) {
        if (y > 270) { doc.addPage(); y = 20; }
        const line = `${m.date}  Настрій: ${m.mood_level > 0 ? '+' : ''}${m.mood_level}  Фаза: ${phaseLabels[m.phase] || m.phase}  Енергія: ${m.energy_level ?? '—'}/10  Сон: ${m.sleep_hours ?? '—'}г`;
        doc.text(line, 14, y);
        y += 5;
        if (m.notes) {
          doc.setTextColor(100);
          doc.text(`  Нотатки: ${m.notes.slice(0, 100)}`, 14, y);
          doc.setTextColor(0);
          y += 5;
        }
      }

      if (medications.length > 0) {
        y += 6;
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.text('Ліки', 14, y);
        y += 7;
        doc.setFontSize(9);
        for (const med of medications) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`${med.name}  ${med.dosage}  ${med.is_active ? 'Активний' : 'Неактивний'}`, 14, y);
          y += 5;
        }
      }

      doc.save(`cyclothymia_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Експортовано у PDF');
    } catch (e) { console.error(e); toast.error('Помилка при експорті PDF'); }
    setExporting(false);
  };

  const handleExportDOC = async () => {
    setExporting(true);
    try {
      const { moods, medications } = await fetchAllData();
      const dateStr = new Date().toLocaleDateString('uk-UA');
      const phaseLabels = { hypomanic:'Гіпоманія', depressive:'Депресія', aggressive:'Агресія', anxious:'Тривога', dysphoric:'Дисфорія', apathetic:'Апатія', mixed:'Змішана', stable:'Стабільний' };

      let html = `<html><head><meta charset="UTF-8">
        <style>body{font-family:Arial,sans-serif;font-size:11pt;margin:2cm;}
        h1{font-size:16pt;text-align:center;}h2{font-size:13pt;margin-top:20px;}
        table{border-collapse:collapse;width:100%;margin-top:8px;}
        th,td{border:1px solid #ccc;padding:4px 8px;font-size:9pt;}th{background:#f0f0f0;}</style>
        </head><body>
        <h1>CycloTrack — Звіт про стан</h1>
        <p style="text-align:center;color:#888;">Дата: ${dateStr}</p>
        <h2>Записи настрою</h2>
        <table><tr><th>Дата</th><th>Настрій</th><th>Фаза</th><th>Енергія</th><th>Сон</th><th>Нотатки</th></tr>`;

      for (const m of moods) {
        html += `<tr><td>${m.date}</td><td>${m.mood_level > 0 ? '+' : ''}${m.mood_level}</td>
          <td>${phaseLabels[m.phase] || m.phase}</td>
          <td>${m.energy_level ?? '—'}/10</td><td>${m.sleep_hours ?? '—'}г</td>
          <td>${(m.notes || '').slice(0, 120)}</td></tr>`;
      }
      html += `</table>`;

      if (medications.length > 0) {
        html += `<h2>Ліки</h2><table><tr><th>Назва</th><th>Дозування</th><th>Статус</th></tr>`;
        for (const med of medications) {
          html += `<tr><td>${med.name}</td><td>${med.dosage}</td><td>${med.is_active ? 'Активний' : 'Неактивний'}</td></tr>`;
        }
        html += `</table>`;
      }

      html += `</body></html>`;

      const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
      downloadBlob(blob, `cyclothymia_${new Date().toISOString().split('T')[0]}.doc`);
      toast.success('Експортовано у DOC');
    } catch { toast.error('Помилка при експорті DOC'); }
    setExporting(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        let count = 0;
        const { data: { user } } = await supabase.auth.getUser()
        if (data.moods?.length) {
          await supabase.from('mood_entries').insert(data.moods.map(({ id, created_at, ...rest }) => ({ ...rest, user_id: user.id })))
          count += data.moods.length
        }
        if (data.medications?.length) {
          await supabase.from('medications').insert(data.medications.map(({ id, created_at, ...rest }) => ({ ...rest, user_id: user.id })))
          count += data.medications.length
        }
        toast.success(`Імпортовано ${count} записів`);
      } catch {
        toast.error('Помилка при імпорті. Перевірте формат файлу.');
      }
    };
    input.click();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut()
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await Promise.all([
        supabase.from('mood_entries').delete().eq('user_id', user.id),
        supabase.from('medications').delete().eq('user_id', user.id),
        supabase.from('prescriptions').delete().eq('user_id', user.id),
      ])
      toast.success('Всі дані видалено')
      await supabase.auth.signOut()
    } catch {
      toast.error('Помилка при видаленні даних')
    }
  };


  return (
    <div className="pb-8">
      <PageHeader title="Налаштування" subtitle="Персоналізація та управління даними" />

      <div className="px-5 space-y-5">

        {/* Профіль */}
        {user && (
          <Card className="p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.full_name || 'Користувач'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Мій профіль */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Мій профіль</p>
          <Card className="border border-border">
            <Link to="/profile" className="flex items-center gap-3 w-full p-4 hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Особистий профіль</p>
                <p className="text-xs text-muted-foreground">ПІБ, діагноз, симптоми загострення</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          </Card>
        </section>

        {/* Зовнішній вигляд */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Зовнішній вигляд</p>
          <Card className="border border-border divide-y divide-border">
            <SettingRow
              icon={<Moon className="w-4 h-4 text-indigo-500" />}
              label="Темна тема"
              description="Темний фон для нічного використання"
              checked={settings.darkMode}
              onToggle={() => toggle('darkMode')}
            />
            <SettingRow
              icon={<Smartphone className="w-4 h-4 text-blue-500" />}
              label="Компактний вигляд"
              description="Менші відступи між елементами"
              checked={settings.compactView}
              onToggle={() => toggle('compactView')}
            />
          </Card>
        </section>

        {/* Сповіщення та звук */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Сповіщення</p>
          <Card className="border border-border divide-y divide-border">
            <SettingRow
              icon={<Bell className="w-4 h-4 text-amber-500" />}
              label="Push-сповіщення"
              description="Нагадування про прийом ліків"
              checked={settings.notifications}
              onToggle={() => toggle('notifications')}
            />
            <SettingRow
              icon={<Volume2 className="w-4 h-4 text-green-500" />}
              label="Звукові сигнали"
              description="Звук при записі та підтвердженнях"
              checked={settings.soundEnabled}
              onToggle={() => toggle('soundEnabled')}
            />
          </Card>
        </section>

        {/* Синхронізація */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Синхронізація</p>
          <Card className="border border-border divide-y divide-border">
            <SettingRow
              icon={<RefreshCw className="w-4 h-4 text-cyan-500" />}
              label="Google Документи"
              description="Синхронізація щоденника з Google Drive"
              checked={settings.googleSync}
              onToggle={() => {
                toggle('googleSync');
                if (!settings.googleSync) toast('Google Sync потребує підключення Builder+ підписки', { icon: 'ℹ️' });
              }}
            />
          </Card>
        </section>

        {/* Дані */}
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Управління даними</p>
          <Card className="border border-border divide-y divide-border">
            <ExportRow label="Експорт JSON" description="Резервна копія всіх даних" color="emerald" onClick={handleExportJSON} disabled={exporting} />
            <ExportRow label="Експорт PDF" description="Звіт для лікаря у форматі PDF" color="rose" onClick={handleExportPDF} disabled={exporting} />
            <ExportRow label="Експорт DOC" description="Таблиця у форматі Word/DOC" color="sky" onClick={handleExportDOC} disabled={exporting} />
            <button
              className="flex items-center gap-3 w-full p-4 text-left hover:bg-muted/50 transition-colors"
              onClick={handleImport}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Імпортувати дані</p>
                <p className="text-xs text-muted-foreground">Завантажити записи з JSON-файлу</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </Card>
        </section>

        {/* Вихід та видалення */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Вийти з акаунту
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/5 text-sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Видалити всі мої дані
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Видалити всі дані?</AlertDialogTitle>
                <AlertDialogDescription>
                  Всі записи настрою, ліки, рецепти та профіль будуть назавжди видалені. Цю дію неможливо скасувати.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteAccount}
                >
                  Так, видалити все
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-center text-xs text-muted-foreground">Cyclothymia Tracker v1.0</p>
      </div>
    </div>
  );
}

function ExportRow({ label, description, color, onClick, disabled }) {
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-600',
    rose: 'bg-rose-100 text-rose-600',
    sky: 'bg-sky-100 text-sky-600',
  };
  return (
    <button
      className="flex items-center gap-3 w-full p-4 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Download className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function SettingRow({ icon, label, description, checked, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
