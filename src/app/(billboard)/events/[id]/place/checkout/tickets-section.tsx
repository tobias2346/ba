'use client'
import EventTicket from '@/components/events/event-ticket';
import { Checkout, useEventContext } from '../../context/eventContext';
import modalFeedbackReact from '@/components/shared/feedback-modal';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface Tickets {
  name: string;
  price: number;
  feature: string[];
  id: string;
  isSelected: boolean;
}

const TicketsSection = () => {

  const { checkout, setCheckout, event } = useEventContext();
  const router = useRouter()
  const searchParams = useSearchParams()
  const type: string | null = searchParams.get('type')
  const zone = searchParams.get('zone');

  const baseFilter = (t: Checkout) => t.type.includes(type!) && t.visible && (!zone || t.sectorId === zone);
  const [visibles, setVisibles] = useState([])

  const checkType = () => {

    const newVisibles = checkout.tickets.filter((t: any) => baseFilter(t));
    if (type == 'seats' && newVisibles.length > 1) {
      router.back()
    }
    
    setVisibles(newVisibles)

    const diferentType = checkout.tickets.some((ticket: Checkout) => !ticket.type.includes(type!) && ticket.quantity > 0);

    if (diferentType) {
      modalFeedbackReact(
        "Cambio de ticket",
        "Al cambiar de tipo de ticket, se eliminarán los tickets seleccionados anteriormente",
        "warning",
        true
      )
      setCheckout({
        ...checkout, tickets: checkout.tickets.map((ticket: Checkout) => {
          return { ...ticket, quantity: 0 }
        })
      })
      return
    }

    if (event?.type === 'sectorized' && type === 'ticket') {
      const someIsSelected = checkout.tickets.find(e => e.quantity > 0);
      if (someIsSelected && someIsSelected?.sectorId !== zone) {
        modalFeedbackReact(
          "Cambio de sector",
          "Al cambiar de sector, se eliminarán los tickets seleccionados anteriormente",
          "warning",
          true
        )
        setCheckout({
          ...checkout, tickets: checkout.tickets.map((ticket: Checkout) => {
            return { ...ticket, quantity: 0 }
          })
        })
        return
      }
    }
  }

  useEffect(() => {
    checkType()
  }, [checkout])

  return (
    <div className="w-full md:bg-slate-800 rounded-lg shadow flex flex-col gap-y-2 justify-start items-start p-4 md:p-8 mb-8 h-auto">
      <h2 className="text-xl font-bold font-headline">Elegí tu Ticket</h2>
      {visibles.map((ticket: Checkout) => <EventTicket key={ticket.id} ticket={ticket} />)}
    </div>
  )
}

export default TicketsSection