// context/MyTicketContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

interface Batch {
  batchId: string;
  count: number;
  catalogItem: {
    name: string;
  };
}

interface EventData {
  id: string;
  name: string;
  flyer?: string;
  startDate: string;
  address: { description: string };
}

interface MyTicketContextType {
  availableTickets: string[] | null;
  setAvailableTickets: (tickets: string[] | null) => void;

  selectedTickets: string[] | null;
  setSelectedTickets: (tickets: string[] | null) => void;

  event: EventData | null;
  setEvent: (event: EventData | null) => void;

  batch: Batch | null;
  setBatch: (batch: Batch | null) => void;

  seat: string | null;
  setSeat: (seat: string | null) => void;
}

const MyTicketContext = createContext<MyTicketContextType>({} as MyTicketContextType);

export default function MyTicketProvider({ children }: { children: ReactNode }) {
  const [availableTickets, setAvailableTickets] = useState<string[] | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[] | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [seat, setSeat] = useState<string | null>(null);

  return (
    <MyTicketContext.Provider
      value={{
        selectedTickets,
        setSelectedTickets,
        availableTickets,
        setAvailableTickets,
        event,
        setEvent,
        batch,
        setBatch,
        seat,
        setSeat
      }}
    >
      {children}
    </MyTicketContext.Provider>
  );
}

export const useMyTicketContext = () => useContext(MyTicketContext);
