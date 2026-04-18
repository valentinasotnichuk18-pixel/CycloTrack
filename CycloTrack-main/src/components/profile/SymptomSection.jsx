import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

export default function SymptomSection({ title, color, emoji, suggestions, value = [], onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const remove = (item) => onChange(value.filter(s => s !== item));

  const addSuggestion = (s) => {
    if (!value.includes(s)) onChange([...value, s]);
  };

  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestions.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => addSuggestion(s)}
            className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
              value.includes(s)
                ? 'bg-primary/20 border-primary/40 text-primary font-medium'
                : 'bg-background/60 border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Added items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {value.map(s => (
            <Badge key={s} variant="secondary" className="text-[11px] gap-1 pr-1">
              {s}
              <button type="button" onClick={() => remove(s)} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Додати свій..."
          className="h-8 text-xs bg-background/70"
        />
        <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={add}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
