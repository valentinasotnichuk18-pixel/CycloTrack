import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, User, Calendar, Trash2, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { toast } from 'sonner';

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

export default function Prescriptions() {
  const queryClient = useQueryClient();

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
      if (error) throw error
      return data || []
    },
  });

  const handleDelete = async (id) => {
    const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast.success('Видалено');
    }
  };

  return (
    <div>
      <PageHeader
        title="Рецепти"
        subtitle="Рецепти та рекомендації лікаря"
        action={
          <Link to="/prescriptions/new">
            <Button size="sm" className="bg-primary">
              <Plus className="w-4 h-4 mr-1" />
              Додати
            </Button>
          </Link>
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
        ) : prescriptions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Немає рецептів"
            description="Зберігайте рецепти та рекомендації лікаря"
            action={
              <Link to="/prescriptions/new">
                <Button className="bg-primary">Додати рецепт</Button>
              </Link>
            }
          />
        ) : (
          prescriptions.map(p => (
            <Card key={p.id} className="p-4 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] ${typeColors[p.type]}`}>{typeLabels[p.type]}</Badge>
                    {p.is_active === false && <Badge variant="outline" className="text-[10px]">Неактивний</Badge>}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                  {p.doctor_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" /> {p.doctor_name}
                    </p>
                  )}
                  {p.date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {format(parseISO(p.date), 'd MMMM yyyy', { locale: uk })}
                    </p>
                  )}
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{p.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {p.file_url && (
                    <a href={p.file_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
