'use client'
import React, { use } from 'react'
import EventProvider, { useEventContext } from './context/eventContext';
import EventHeaderBillboard from './event-header-billboard';
import { API_BASE_URL } from '@/services/enviroment';
import { useEffect } from 'react';
import Loading from './loading';
import { RRPPProvider } from '@/contexts/rrpp-context';
import { AccessesProvider } from '@/contexts/accesses-context';

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <EventProvider>
      <AccessesProvider>
        <RRPPProvider>
          <EventLoader id={id}>{children}</EventLoader>
        </RRPPProvider>
      </AccessesProvider>
    </EventProvider>
  );
}

function EventLoader({ id, children }: { id: string; children: React.ReactNode }) {
  const { setEvent, event, setCheckout, checkout } = useEventContext();

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!res.ok) throw new Error('Error obteniendo el evento');
        const data = await res.json();
        setEvent(data);
        setCheckout({
          ...checkout, tickets: data.catalogItems?.map((item: any) => ({
            ...item,
            isSelected: false,
            quantity: 0,
          })) || []
        });
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, [id, setEvent, setCheckout]);

  return (
    <section className="min-h-screen font-body flex flex-col">
      <EventHeaderBillboard />
      {event
        ? React.Children.map(children, (child) => child) // 👈 fix para 1 o varios hijos
        : <Loading />}
    </section>
  );
}
