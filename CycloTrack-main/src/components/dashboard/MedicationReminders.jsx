import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export default function MedicationReminders({ medications, intakes, onIntakeLogged }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const queryClient = useQueryClient();

  const activeMeds = (medications || []).filter(m => m.is_active !== false);

  const pendingMeds = activeMeds.map(med => {
    const times = med.times || ['08:00'];
    const todayIntakes = (intakes || []).filter(
      i => i.medication_id === med.id && i.date === today
    );
    const pendingTimes = times.filter(
      t => !todayIntakes.find(i => i.time === t)
    );
    return { ...med, pendingTimes, todayIntakes };
  }).filter(m => m.pendingTimes.length > 0);

  const { mutate: takeMed, variables: takingVars } = useMutation({
    mutationFn: async ({ med, time }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
          .from('medication_intakes')
          .insert([{
            medication_id: med.id,
            medication_name: med.name,
            date: today,
            time,
            taken: true,
            user_id: user.id,
          }]);
      if (error) throw error;
    },
    onMutate: async ({ med, time }) => {
      await queryClient.cancelQueries({ queryKey: ['intakes-today'] });
      const previous = queryClient.getQueryData(['intakes-today']);
      queryClient.setQueryData(['intakes-today'], (old = []) => [
        ...old,
        { medication_id: med.id, medication_name: med.name, date: today, time, taken: true, id: `optimistic-${med.id}-${time}` },
      ]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['intakes-today'], ctx.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intakes-today'] });
      onIntakeLogged?.();
    },
  });

  if (pendingMeds.length === 0) {
    return (
      <Card className="p-4 rounded-2xl border-0 bg-emerald-50">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Усі ліки прийнято на сьогодні</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {pendingMeds.map(med =>
        med.pendingTimes.map(time => {
          const isTaking = takingVars?.med?.id === med.id && takingVars?.time === time;
          return (
            <Card key={`${med.id}-${time}`} className="p-4 rounded-2xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{med.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{med.dosage}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {time}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={isTaking}
                  onClick={() => takeMed({ med, time })}
                  className="bg-primary rounded-xl h-9 px-4"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {isTaking ? '...' : 'Прийняти'}
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
