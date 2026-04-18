import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';

const PHASE_COLORS = {
  hypomanic: '#f59e0b',
  depressive: '#3b82f6',
  aggressive: '#ef4444',
  anxious: '#f97316',
  dysphoric: '#a855f7',
  apathetic: '#6b7280',
  mixed: '#8b5cf6',
  stable: '#10b981',
};

const PHASE_LABELS = {
  hypomanic: 'Гіпоманія',
  depressive: 'Депресія',
  aggressive: 'Агресія',
  anxious: 'Тривога',
  dysphoric: 'Дисфорія',
  apathetic: 'Апатія',
  mixed: 'Змішана',
  stable: 'Стабільний',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs min-w-[150px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.dataKey === 'mood' && p.value > 0 ? `+${p.value}` : p.value}
            {p.dataKey === 'energy' ? '/10' : ''}
          </span>
        </div>
      ))}
      {entry?.phase && (
        <div className="mt-1.5 pt-1.5 border-t border-border">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              background: `${PHASE_COLORS[entry.phase]}20`,
              color: PHASE_COLORS[entry.phase],
            }}
          >
            {PHASE_LABELS[entry.phase] || entry.phase}
          </span>
        </div>
      )}
    </div>
  );
}

const PERIODS = [
  { label: '7д', days: 7 },
  { label: '14д', days: 14 },
  { label: '30д', days: 30 },
];

export default function MoodMiniChart({ entries }) {
  const [period, setPeriod] = useState(14);

  if (!entries || entries.length < 2) {
    return (
      <Card className="p-4 rounded-2xl border border-border bg-card">
        <p className="text-xs text-muted-foreground text-center py-4">
          Потрібно мінімум 2 записи для графіка
        </p>
      </Card>
    );
  }

  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-period)
    .map(e => ({
      date: format(parseISO(e.date), 'd MMM', { locale: uk }),
      mood: e.mood_level,
      energy: e.energy_level ?? null,
      phase: e.phase,
    }));

  const avgMood = (data.reduce((s, d) => s + (d.mood ?? 0), 0) / data.length).toFixed(1);
  const avgEnergy = data.filter(d => d.energy !== null).length > 0
    ? (data.reduce((s, d) => s + (d.energy ?? 0), 0) / data.filter(d => d.energy !== null).length).toFixed(1)
    : null;

  return (
    <Card className="p-4 rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Динаміка стану</h3>
          <p className="text-xs text-muted-foreground">Настрій та енергія</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                period === p.days
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          <span className="text-xs text-muted-foreground">Настрій:</span>
          <span className="text-xs font-semibold text-foreground">
            {avgMood > 0 ? `+${avgMood}` : avgMood}
          </span>
        </div>
        {avgEnergy && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            <span className="text-xs text-muted-foreground">Енергія:</span>
            <span className="text-xs font-semibold text-foreground">{avgEnergy}/10</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(250,60%,55%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(250,60%,55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(230,10%,45%)' }}
              tickLine={false}
              axisLine={false}
              interval={period <= 7 ? 0 : period <= 14 ? 1 : 'preserveStartEnd'}
            />
            <YAxis
              yAxisId="mood"
              domain={[-5, 5]}
              tick={{ fontSize: 10, fill: 'hsl(230,10%,45%)' }}
              tickLine={false}
              axisLine={false}
              ticks={[-5, -2.5, 0, 2.5, 5]}
              tickFormatter={v => v > 0 ? `+${v}` : v}
            />
            <YAxis
              yAxisId="energy"
              orientation="right"
              domain={[0, 10]}
              tick={{ fontSize: 10, fill: 'hsl(195,70%,45%)' }}
              tickLine={false}
              axisLine={false}
              ticks={[0, 5, 10]}
              width={24}
            />
            <ReferenceLine yAxisId="mood" y={0} stroke="hsl(220,15%,80%)" strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="mood"
              type="monotone"
              dataKey="mood"
              name="Настрій"
              stroke="hsl(250,60%,55%)"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: 'hsl(250,60%,55%)', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(250,60%,75%)' }}
              connectNulls
            />
            <Line
              yAxisId="energy"
              type="monotone"
              dataKey="energy"
              name="Енергія"
              stroke="hsl(195,70%,50%)"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 2.5, fill: 'hsl(195,70%,50%)', strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(195,70%,70%)' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="hsl(250,60%,55%)" strokeWidth="2.5"/></svg>
          <span className="text-[11px] text-muted-foreground">Настрій (-5…+5)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="8">
            <line x1="0" y1="4" x2="5" y2="4" stroke="hsl(195,70%,50%)" strokeWidth="2" />
            <line x1="8" y1="4" x2="13" y2="4" stroke="hsl(195,70%,50%)" strokeWidth="2" />
            <line x1="16" y1="4" x2="20" y2="4" stroke="hsl(195,70%,50%)" strokeWidth="2" />
          </svg>
          <span className="text-[11px] text-muted-foreground">Енергія (0–10)</span>
        </div>
      </div>
    </Card>
  );
}
