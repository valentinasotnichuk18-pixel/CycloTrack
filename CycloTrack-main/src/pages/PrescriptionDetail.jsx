import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar } from 'lucide-react';

const typeLabels = {
  prescription: 'Рецепт',
  recommendation: 'Рекомендація',
  referral: 'Направлення',
  analysis: 'Аналіз',
};

const typeColors = {
  prescription: 'bg-primary/10 text-primary',
  recommendation: 'bg-emerald-100 text-emerald-700',
  referral: 'bg-accent/10 text-accent',
  analysis: 'bg-amber-100 text-amber-700',
};

export default function PrescriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: prescription, isLoading } = useQuery({
    queryKey: ['prescription', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
      if (error) throw error;
      return data;
    },
  });

  const isPDF = prescription?.file_url?.toLowerCase().includes('.pdf');

  return (
      <div>
        <div className="px-5 pt-6 pb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Деталі рецепту</h1>
        </div>

        <div className="px-5 pb-8">
          {isLoading ? (
              <Card className="p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </Card>
          ) : !prescription ? (
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground">Рецепт не знайдено.</p>
              </Card>
          ) : (
              <Card className="p-5 border border-border space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${typeColors[prescription.type]}`}>
                    {typeLabels[prescription.type]}
                  </Badge>
                  {prescription.is_active === false && (
                      <Badge variant="outline" className="text-[10px]">Неактивний</Badge>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-foreground">{prescription.title}</h2>

                {prescription.doctor_name && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> {prescription.doctor_name}
                    </p>
                )}

                {prescription.date && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(prescription.date), 'd MMMM yyyy', { locale: uk })}
                    </p>
                )}

                {prescription.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Опис / Рекомендації</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{prescription.description}</p>
                    </div>
                )}

                {prescription.file_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Файл документа</p>
                      {isPDF ? (
                          <iframe
                             src={`${prescription.file_url}#zoom=100`}
                              className="w-full h-[60vh] rounded-lg border border-border"
                              title="Файл рецепту"
                          />
                      ) : (
                          <img
                              src={prescription.file_url}
                              alt="Файл рецепту"
                              className="w-full object-contain max-h-[60vh] rounded-lg border border-border"
                          />
                      )}
                    </div>
                )}
              </Card>
          )}
        </div>
      </div>
  );
}