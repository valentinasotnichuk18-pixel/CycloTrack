import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

/**
 * Fires a browser Notification when a medication is due (±1 min window).
 * Runs every 30s so it won't miss a minute.
 */
export default function useMedicationReminders() {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const check = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      let medications, intakes;
      try {
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const { data: { user } } = await supabase.auth.getUser();
        const [{ data: meds }, { data: intakeData }] = await Promise.all([
          supabase.from('medications').select('*').eq('user_id', user.id).eq('is_active', true),
          supabase.from('medication_intakes').select('*').eq('user_id', user.id).eq('date', todayStr),
        ]);
        medications = meds || [];
        intakes = intakeData || [];

        const activeMeds = (medications || []).filter(m => m.is_active !== false);

        for (const med of activeMeds) {
          const times = med.times || [];
          for (const t of times) {
            const [h, m] = t.split(':').map(Number);
            const medMinutes = h * 60 + m;
            // fire within a ±1 minute window
            if (Math.abs(nowMinutes - medMinutes) > 1) continue;

            const key = `${todayStr}-${med.id}-${t}`;
            if (notifiedRef.current.has(key)) continue;

            const alreadyTaken = (intakes || []).some(
              i => i.medication_id === med.id && i.time === t && i.taken
            );
            notifiedRef.current.add(key);
            if (alreadyTaken) continue;

            new Notification(`💊 Час прийняти ${med.name}`, {
              body: `${med.dosage} — ${t}`,
              icon: '/favicon.ico',
              tag: key,
            });
          }
        }
      } catch (e) {
        // silently ignore auth/network errors
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);
}
