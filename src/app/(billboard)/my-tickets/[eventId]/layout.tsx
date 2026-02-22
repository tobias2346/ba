'use client'
import React, { use } from 'react'
import { API_BASE_URL } from '@/services/enviroment';
import { useEffect } from 'react';
import Loading from './loading';
import MyTicketsHeader from './my-ticketsheader';
import MyTicketProvider, { useMyTicketContext } from './context/my-ticketsContext';

export default function MyTicketsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  return (
    <MyTicketProvider>
      <MyTicketLoader id={eventId}>{children}</MyTicketLoader>
    </MyTicketProvider>
  );
}

function MyTicketLoader({ id, children }: { id: string; children: React.ReactNode }) {
  const {setEvent, event} = useMyTicketContext()
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!res.ok) throw new Error('Error obteniendo el evento');
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, [id, setEvent]);

  return (
    <section className="min-h-screen font-body flex flex-col">
      <MyTicketsHeader />
      {event
        ? React.Children.map(children, (child) => child) // 👈 fix para 1 o varios hijos
        : <Loading />}
    </section>
  );
}
