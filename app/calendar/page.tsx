'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

import { Calendar as FullCalendarCtor } from '@fullcalendar/core';   // 👈 constructor (runtime)
import type { Calendar as FullCalendar } from '@fullcalendar/core'; // 👈 sadece tip (compile-time)
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import RequireAuth from '@/components/RequireAuth';

export default function Page() {
  const ref = useRef<HTMLDivElement>(null);
  const [cal, setCal] = useState<FullCalendar | null>(null); // 👈 tip ayrı isimle
  const [events, setEvents] = useState<any[]>([]);

  const load = async () => {
    const data = await api<any[]>('/api/calendar');
    const evs = data.map(e => ({ id: String(e.id), title: e.title, start: e.start, end: e.end }));
    setEvents(evs);
    if (cal) {
      cal.removeAllEvents();
      cal.addEventSource(evs);
    }
  };

  useEffect(() => {
    if (!ref.current) return;

    const calendar = new FullCalendarCtor(ref.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      editable: true,
      droppable: true,
      headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
      events,
      eventDrop: async (info) => {
        const e = info.event;
        await api(`/api/calendar/${e.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            job_id: 1,
            step_id: null,
            title: e.title,
            start: e.start!.toISOString(),
            end: e.end?.toISOString() || e.start!.toISOString(),
          }),
        });
        load();
      },
      eventResize: async (info) => {
        const e = info.event;
        await api(`/api/calendar/${e.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            job_id: 1,
            step_id: null,
            title: e.title,
            start: e.start!.toISOString(),
            end: e.end?.toISOString() || e.start!.toISOString(),
          }),
        });
        load();
      },
    });

    calendar.render();
    setCal(calendar);
    load();

    return () => {
      calendar.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);

  const create = async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    await api('/api/calendar', {
      method: 'POST',
      body: JSON.stringify({ job_id: 1, title: 'Yeni Etkinlik', start: now.toISOString(), end: later.toISOString() }),
    });
    load();
  };

  return (
    <RequireAuth>
      <div className="space-y-3">
        <div className="card p-4 flex items-center justify-between">
          <div className="font-medium">Takvim</div>
          <div className="flex gap-2">
            <button className="btn" onClick={create}>Örnek Etkinlik Ekle</button>
            <a
              className="btn"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open((process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/calendar/ics', '_blank');
              }}
            >
              ICS Dışa Aktar
            </a>
          </div>
        </div>
        <div className="card p-2">
          <div ref={ref} />
        </div>
      </div>
    </RequireAuth>
  );
}
