import React from 'react';
import { Slider } from '@/components/ui/slider';

const moodEmojis = {
  '-5': '😞', '-4': '😢', '-3': '😔', '-2': '🙁', '-1': '😕',
  '0': '😐', '1': '🙂', '2': '😊', '3': '😄', '4': '🤩', '5': '⚡',
};

export default function MoodSlider({ value, onChange }) {
  const level = value.toString();

  // Колір фону залежно від значення
  const bgColor = value > 0
    ? `hsl(45, ${20 + value * 15}%, ${95 - value * 3}%)`
    : value < 0
    ? `hsl(220, ${20 + Math.abs(value) * 12}%, ${95 - Math.abs(value) * 3}%)`
    : 'hsl(220, 10%, 96%)';

  const displayValue = value > 0 ? `+${value}` : value;

  return (
    <div className="rounded-2xl p-5 transition-colors duration-300" style={{ backgroundColor: bgColor }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">Загальний рівень настрою</span>
        <span className="text-lg font-bold text-foreground">{displayValue}</span>
      </div>
      <div className="text-center my-3">
        <span className="text-5xl">{moodEmojis[level]}</span>
      </div>
      <Slider
        min={-5}
        max={5}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="mt-2"
      />
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">−5 Тяжка депресія</span>
        <span className="text-[10px] text-muted-foreground">+5 Гіпоманія</span>
      </div>
    </div>
  );
}
