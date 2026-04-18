import React, { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EMOTIONAL_CATEGORIES, EMOTIONAL_STATES, STATES_BY_CATEGORY, getStateById } from '@/lib/emotionalStates';
import { ChevronDown, Info } from 'lucide-react';

export default function EmotionalStatePicker({ value, onChange }) {
  const selectedState = getStateById(value);
  const category = selectedState ? EMOTIONAL_CATEGORIES[selectedState.category] : null;

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">
        Емоційний стан
      </label>

      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className="h-auto min-h-[48px] py-2">
          {selectedState ? (
            <div className="flex items-center gap-2 text-left">
              <span className="text-xl">{selectedState.emoji}</span>
              <div>
                <p className="text-sm font-medium">{selectedState.label}</p>
                <p className="text-[11px] text-muted-foreground">{selectedState.description}</p>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Оберіть стан...</span>
          )}
        </SelectTrigger>

        <SelectContent className="max-h-[400px]">
          {Object.entries(STATES_BY_CATEGORY).map(([catKey, states]) => {
            if (states.length === 0) return null;
            const cat = EMOTIONAL_CATEGORIES[catKey];
            return (
              <SelectGroup key={catKey}>
                <SelectLabel className="flex items-center gap-1.5 py-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${cat.bgClass.replace('bg-', 'bg-').replace('-50', '-400')}`} />
                  <span className={`text-xs font-semibold ${cat.textClass}`}>{cat.label}</span>
                </SelectLabel>
                {states.map(state => (
                  <SelectItem key={state.id} value={state.id} className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{state.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{state.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{state.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>

      {/* Показуємо типові симптоми для обраного стану */}
      {selectedState?.symptoms?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted-foreground self-center flex items-center gap-1">
            <Info className="w-3 h-3" /> Типові симптоми:
          </span>
          {selectedState.symptoms.map(s => (
            <Badge key={s} variant="outline" className={`text-[10px] py-0.5 ${category?.badgeClass}`}>
              {s}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
