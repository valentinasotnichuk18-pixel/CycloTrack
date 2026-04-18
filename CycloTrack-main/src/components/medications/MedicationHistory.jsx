import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, subDays } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, X, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const frequencyLabels = {
  once_daily: '1 раз/день',
  twice_daily: '2 рази/день',
  three_daily: '3 рази/день',
  as_needed: 'За потребою',
  weekly: 'Щотижня',
};

export default function MedicationHistory({ medication, onBack }) {
  const queryClient = useQueryClient();

  const { data: intakes = [] } = useQuery({
    queryKey: ['intakes', medication.id],
    queryFn: async () => {
      const { data } = await supabase
          .from('medication_intakes')
          .select('*')
          .eq('medication_id', medication.id)
          .order('date', { ascending: false })
          .limit(50);
      return data || [];
    },
  });

  const handleLogIntake = async (taken) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('medication_intakes').insert([{
      medication_id: medication.id,
      medication_name: medication.name,
      date: today,
      time: now,
      taken,
      user_id: user.id,
    }]);
    queryClient.invalidateQueries({ queryKey: ['intakes', medication.id] });
    toast.success(taken ? 'Прийнято' : 'Пропущено');
  };

  const handleDelete = async () => {
    await supabase.from('medications').delete().eq('id', medication.id);
    queryClient.invalidateQueries({ queryKey: ['medications'] });
    toast.success(`${medication.name} видалено`);
    onBack();
  };

  // Group intakes by date
  const grouped = intakes.reduce((acc, intake) => {
    if (!acc[intake.date]) acc[intake.date] = [];
    acc[intake.date].push(intake);
    return acc;
  }, {});

  return (
    <div>
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{medication.name}</h1>
          <p className="text-xs text-muted-foreground">{medication.dosage} · {frequencyLabels[medication.frequency]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-5 space-y-4 pb-8">
        {/* Quick log */}
        <Card className="p-4 border-0 bg-primary/5">
          <p className="text-xs text-muted-foreground mb-3">Записати прийом зараз</p>
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => handleLogIntake(true)}>
              <Check className="w-4 h-4 mr-1" /> Прийняв
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleLogIntake(false)}>
              <X className="w-4 h-4 mr-1" /> Пропустив
            </Button>
          </div>
        </Card>

        {/* Info */}
        {(medication.notes || medication.side_effects) && (
          <Card className="p-4 border border-border">
            {medication.notes && (
              <div className="mb-2">
                <p className="text-xs font-medium text-muted-foreground">Нотатки</p>
                <p className="text-sm text-foreground mt-0.5">{medication.notes}</p>
              </div>
            )}
            {medication.side_effects && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Побічні ефекти</p>
                <p className="text-sm text-foreground mt-0.5">{medication.side_effects}</p>
              </div>
            )}
          </Card>
        )}

        {/* History */}
        <div>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Історія прийому
          </h2>
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-muted-foreground">Ще немає записів</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(grouped)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, items]) => (
                  <Card key={date} className="p-3 border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      {format(parseISO(date), 'd MMMM yyyy', { locale: uk })}
                    </p>
                    <div className="space-y-1">
                      {items.map(intake => (
                        <div key={intake.id} className="flex items-center gap-2">
                          {intake.taken ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-destructive" />
                          )}
                          <span className="text-xs text-foreground">
                            {intake.time || '—'}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {intake.taken ? 'Прийнято' : 'Пропущено'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
