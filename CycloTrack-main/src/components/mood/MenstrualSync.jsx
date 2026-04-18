import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart } from 'lucide-react';

const menstrualPhaseLabels = {
  menstruation: 'Менструація (дні 1-5)',
  follicular: 'Фолікулярна (дні 6-13)',
  ovulation: 'Овуляція (дні 14-16)',
  luteal: 'Лютеїнова (дні 17-28)',
  none: 'Не відстежую',
};

export default function MenstrualSync({ day, phase, onDayChange, onPhaseChange }) {
  return (
    <Card className="p-4 border border-pink-200 bg-pink-50/50">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-pink-500" />
        <span className="text-sm font-semibold text-foreground">Менструальний цикл</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Синхронізація з циклом допоможе виявити зв'язок між гормонами та фазами циклотимії
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">День циклу</Label>
          <Input
            type="number"
            min={1}
            max={45}
            value={day || ''}
            onChange={(e) => onDayChange(parseInt(e.target.value) || null)}
            placeholder="1-28"
            className="mt-1 h-9"
          />
        </div>
        <div>
          <Label className="text-xs">Фаза циклу</Label>
          <Select value={phase || 'none'} onValueChange={onPhaseChange}>
            <SelectTrigger className="mt-1 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(menstrualPhaseLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
