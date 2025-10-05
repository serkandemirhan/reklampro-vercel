
'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import FullCalendar from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Page(){
  const ref = useRef<HTMLDivElement>(null);
  const [cal, setCal] = useState<FullCalendar.Calendar | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const load = async()=>{
    const data = await api<any[]>('/calendar/');
    setEvents(data.map(e=>({ id: String(e.id), title: e.title, start: e.start, end: e.end })));
    if (cal) cal.removeAllEvents(), cal.addEventSource(data.map(e=>({ id: String(e.id), title: e.title, start: e.start, end: e.end })));
  };

  useEffect(()=>{
    if (!ref.current) return;
    const calendar = new FullCalendar.Calendar(ref.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      editable: true,
      droppable: true,
      headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
      events: events,
      eventDrop: async (info)=>{
        const e = info.event;
        await api(`/calendar/${e.id}`, { method:'PATCH', body: JSON.stringify({ job_id: 1, step_id: null, title: e.title, start: e.start!.toISOString(), end: e.end?.toISOString() || e.start!.toISOString() }) });
        load();
      },
      eventResize: async (info)=>{
        const e = info.event;
        await api(`/calendar/${e.id}`, { method:'PATCH', body: JSON.stringify({ job_id: 1, step_id: null, title: e.title, start: e.start!.toISOString(), end: e.end?.toISOString() || e.start!.toISOString() }) });
        load();
      }
    });
    calendar.render();
    setCal(calendar);
    load();
    return ()=> { calendar.destroy(); };
  }, [ref.current]);

  const create = async()=>{
    const now = new Date(); const later = new Date(now.getTime()+60*60*1000);
    await api('/calendar/', { method:'POST', body: JSON.stringify({ job_id: 1, title: 'Yeni Etkinlik', start: now.toISOString(), end: later.toISOString() }) });
    load();
  };

  return (
    <RequireAuth>
      <div className="space-y-3">
        <div className="card p-4 flex items-center justify-between">
          <div className="font-medium">Takvim</div>
          <div className="flex gap-2">
            <button className="btn" onClick={create}>Örnek Etkinlik Ekle</button>
            <a className="btn" href="/api/calendar.ics" onClick={(e)=>{ e.preventDefault(); window.open((process.env.NEXT_PUBLIC_API_BASE||'http://localhost:8000')+'/calendar/ics','_blank'); }}>ICS Dışa Aktar</a>
          </div>
        </div>
        <div className="card p-2">
          <div ref={ref} />
        </div>
      </div>
    </RequireAuth>
  );
}
