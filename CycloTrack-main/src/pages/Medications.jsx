import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pill, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/shared/EmptyState';
import AddMedicationSheet from '@/components/medications/AddMedicationSheet';
import MedicationHistory from '@/components/medications/MedicationHistory';

const frequencyLabels = {
  once_daily: '1 раз/день',
  twice_daily: '2 рази/день',
  three_daily: '3 рази/день',
  as_needed: 'За потребою',
  weekly: 'Щотижня',
};

export default function Medications() {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
          .from('medications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  });

  const toggleActive = async (med) => {
    const { error } = await supabase
        .from('medications')
        .update({ is_active: !med.is_active })
        .eq('id', med.id)
    if (!error) queryClient.invalidateQueries({ queryKey: ['medications'] });
  };

  const onMedSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['medications'] });
    setShowAdd(false);
  };

  if (selectedMed) {
    return <MedicationHistory medication={selectedMed} onBack={() => setSelectedMed(null)} />;
  }

  return (
    <div>
      <PageHeader
        title="Мої ліки"
        subtitle="Відстеження прийому та дозувань"
        action={
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => navigate(-1)} className="w-9 h-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button size="sm" className="bg-primary" onClick={() => navigate('/medications/new')}>
              <Plus className="w-4 h-4 mr-1" />
              Додати
            </Button>
          </div>
        }
      />

      <div className="px-5 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : medications.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="Немає ліків"
            description="Додайте ваші ліки для відстеження прийому"
           action={<Button className="bg-primary" onClick={() => navigate('/medications/new')}>Додати ліки</Button>}
          />
        ) : (
          medications.map(med => (
            <Card
              key={med.id}
              className="p-4 border border-border cursor-pointer hover:shadow-sm transition-all"
              onClick={() => setSelectedMed(med)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{med.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{med.dosage}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {frequencyLabels[med.frequency]}
                    </span>
                    {med.times?.length > 0 && (
                      <span>{med.times.join(', ')}</span>
                    )}
                  </div>
                  {med.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{med.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={med.is_active !== false}
                    onCheckedChange={(e) => { e.stopPropagation?.(); toggleActive(med); }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AddMedicationSheet open={showAdd} onOpenChange={setShowAdd} onSaved={onMedSaved} />
    </div>
  );
}
