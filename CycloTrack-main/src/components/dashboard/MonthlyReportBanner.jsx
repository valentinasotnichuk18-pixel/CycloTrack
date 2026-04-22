import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, X, ChevronDown, ChevronUp, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function MonthlyReportBanner({ moodEntries, profile }) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['monthlyReports'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
          .from('monthly_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(12);
      return data || [];
    },
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
          .from('monthly_reports')
          .update({ dismissed: true })
          .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyReports'] }),
  });

  if (!user || !profile) return null;

  const joinDate = new Date(user.created_date);
  const now = new Date();
  const daysSinceJoin = differenceInDays(now, joinDate);

  // Show report only after at least 28 days since joining
  if (daysSinceJoin < 28) return null;

  // Current month period
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthKey = format(now, 'yyyy-MM');

  // Check if report for this month was already dismissed
  const thisMonthReport = reports.find(r => r.month_key === monthKey);
  if (thisMonthReport?.dismissed) return null;

  // Calculate stats for the current month
  const monthEntries = moodEntries.filter(e => {
    const d = new Date(e.date);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  if (monthEntries.length === 0) return null;

  const avgMood = (monthEntries.reduce((s, e) => s + (e.mood_level || 0), 0) / monthEntries.length).toFixed(1);
  const avgSleep = monthEntries.filter(e => e.sleep_hours).length > 0
    ? (monthEntries.reduce((s, e) => s + (e.sleep_hours || 0), 0) / monthEntries.filter(e => e.sleep_hours).length).toFixed(1)
    : null;
  const avgEnergy = monthEntries.filter(e => e.energy_level).length > 0
    ? (monthEntries.reduce((s, e) => s + (e.energy_level || 0), 0) / monthEntries.filter(e => e.energy_level).length).toFixed(1)
    : null;

  const phaseCounts = {};
  monthEntries.forEach(e => {
    if (e.phase) phaseCounts[e.phase] = (phaseCounts[e.phase] || 0) + 1;
  });
  const dominantPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const phaseLabels = {
    hypomanic: 'Гіпоманія ⚡',
    depressive: 'Депресія 🌧️',
    aggressive: 'Агресія 🔥',
    apathetic: 'Апатія 🪨',
    stable: 'Стабільний стан ✅',
    mixed: 'Змішаний стан',
    anxious: 'Тривожність',
    dysphoric: 'Дисфорія',
  };

  const monthName = format(now, 'LLLL yyyy', { locale: uk });

  const handleExportPDF = async () => {
    setExporting(true);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(108, 92, 231);
    doc.rect(0, 0, pageW, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Cyclothymia - Monthly Report', pageW / 2, 9, { align: 'center' });

    y = 24;
    doc.setTextColor(30, 30, 40);
    doc.setFontSize(16);
    doc.text(`Report: ${monthName}`, pageW / 2, y, { align: 'center' });
    y += 6;

    if (profile?.full_name) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 120);
      doc.text(`Patient: ${profile.full_name}`, pageW / 2, y, { align: 'center' });
      y += 5;
    }
    doc.text(`Generated: ${format(new Date(), 'dd.MM.yyyy')}`, pageW / 2, y, { align: 'center' });
    y += 10;

    // Divider
    doc.setDrawColor(200, 200, 220);
    doc.line(15, y, pageW - 15, y);
    y += 8;

    // Summary stats
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 40);
    doc.text('Summary Statistics', 15, y);
    y += 7;

    const stats = [
      ['Total mood entries', `${monthEntries.length}`],
      ['Average mood level', `${avgMood} / 5`],
      avgSleep ? ['Average sleep', `${avgSleep} hours`] : null,
      avgEnergy ? ['Average energy', `${avgEnergy} / 10`] : null,
      dominantPhase ? ['Dominant phase', phaseLabels[dominantPhase] || dominantPhase] : null,
    ].filter(Boolean);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    stats.forEach(([label, value]) => {
      doc.setTextColor(100, 100, 120);
      doc.text(label + ':', 20, y);
      doc.setTextColor(30, 30, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 90, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
    });

    y += 4;
    doc.line(15, y, pageW - 15, y);
    y += 8;

    // Mood log
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 40);
    doc.text('Mood Log', 15, y);
    y += 7;

    // Table header
    doc.setFillColor(240, 238, 255);
    doc.rect(15, y - 4, pageW - 30, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 70, 140);
    doc.text('Date', 18, y);
    doc.text('Mood', 55, y);
    doc.text('Phase', 75, y);
    doc.text('Energy', 120, y);
    doc.text('Sleep', 150, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    [...monthEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((entry, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (i % 2 === 0) {
          doc.setFillColor(248, 248, 252);
          doc.rect(15, y - 3.5, pageW - 30, 6, 'F');
        }
        doc.setTextColor(50, 50, 70);
        doc.text(entry.date, 18, y);
        doc.text(`${entry.mood_level > 0 ? '+' : ''}${entry.mood_level}`, 58, y);
        doc.text(entry.phase || '—', 75, y);
        doc.text(entry.energy_level ? `${entry.energy_level}/10` : '—', 120, y);
        doc.text(entry.sleep_hours ? `${entry.sleep_hours}h` : '—', 150, y);
        y += 6;
      });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 180);
      doc.text('Cyclothymia App — For doctor use only', 15, 290);
      doc.text(`Page ${i} / ${pageCount}`, pageW - 15, 290, { align: 'right' });
    }

    doc.save(`cyclothymia-report-${monthKey}.pdf`);
    setExporting(false);
  };

  const handleDismiss = async () => {
    if (thisMonthReport) {
      dismissMutation.mutate(thisMonthReport.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('monthly_reports').insert([{
        month_key: monthKey,
        dismissed: true,
        avg_mood: parseFloat(avgMood),
        entries_count: monthEntries.length,
        dominant_phase: dominantPhase,
        user_id: user.id,
      }]);
      queryClient.invalidateQueries({ queryKey: ['monthlyReports'] });
    }
  };

  return (
    <Card className="border border-primary/30 bg-primary/5 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Звіт за {monthName}</p>
              <p className="text-xs text-muted-foreground">{monthEntries.length} записів цього місяця</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(v => !v)} className="p-1 rounded-lg hover:bg-muted/50">
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-muted/50">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="Настрій" value={avgMood} unit="/5" />
              {avgSleep && <StatBox label="Сон" value={avgSleep} unit="год" />}
              {avgEnergy && <StatBox label="Енергія" value={avgEnergy} unit="/10" />}
            </div>
            {dominantPhase && (
              <div className="rounded-xl bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Домінуюча фаза</p>
                <p className="text-sm font-semibold text-foreground">{phaseLabels[dominantPhase] || dominantPhase}</p>
              </div>
            )}
            <Button
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Генерація PDF...</>
                : <><Download className="w-4 h-4 mr-2" /> Експортувати звіт для лікаря</>
              }
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function StatBox({ label, value, unit }) {
  return (
    <div className="rounded-xl bg-card border border-border p-3 text-center">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-base font-bold text-foreground">{value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span></p>
    </div>
  );
}
