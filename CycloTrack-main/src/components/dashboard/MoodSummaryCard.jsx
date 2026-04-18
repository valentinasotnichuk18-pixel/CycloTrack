import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EMOTIONAL_CATEGORIES, getStateById } from '@/lib/emotionalStates';

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
  hypomanic: 'text-amber-600 bg-amber-50',
  depressive: 'text-blue-600 bg-blue-50',
  aggressive: 'text-red-600 bg-red-50',
  anxious: 'text-orange-600 bg-orange-50',
  dysphoric: 'text-purple-600 bg-purple-50',
  apathetic: 'text-slate-500 bg-slate-100',
  mixed: 'text-purple-600 bg-purple-50',
  stable: 'text-emerald-600 bg-emerald-50',
};

export default function MoodSummaryCard({ latestEntry }) {
  if (!latestEntry) {
    return (
      <Card className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-0">
        <p className="text-sm font-medium text-foreground">Ще немає записів настрою</p>
        <p className="text-xs text-muted-foreground mt-1">Додайте перший запис у розділі «Настрій»</p>
      </Card>
    );
  }

  const moodLevel = latestEntry.mood_level || 0;
  const phase = latestEntry.phase || 'stable';
  const emotionalState = latestEntry.emotional_state ? getStateById(latestEntry.emotional_state) : null;
  const TrendIcon = moodLevel > 0 ? TrendingUp : moodLevel < 0 ? TrendingDown : Minus;

  return (
    <Card className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border-0 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Поточний стан</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${phaseColors[phase] || phaseColors.stable}`}>
          {phaseLabels[phase] || phase}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {emotionalState && <span className="text-3xl">{emotionalState.emoji}</span>}
          <div>
            {emotionalState && (
              <p className="text-sm font-semibold text-foreground">{emotionalState.label}</p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-foreground">
                {moodLevel > 0 ? `+${moodLevel}` : moodLevel}
              </span>
              <TrendIcon className={`w-4 h-4 ${moodLevel > 0 ? 'text-amber-500' : moodLevel < 0 ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-3 pt-3 border-t border-border/40">
        <span className="text-xs text-muted-foreground">⚡ {latestEntry.energy_level || '—'}/10</span>
        <span className="text-xs text-muted-foreground">🌙 {latestEntry.sleep_hours || '—'} год</span>
        <span className="text-xs text-muted-foreground">😰 {latestEntry.anxiety_level || '—'}/10</span>
      </div>
    </Card>
  );
}
