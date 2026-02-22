'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { UserCircle } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useMyTicketContext } from '../../../context/my-ticketsContext';
import { API_BASE_URL, credentialsOption } from '@/services/enviroment';

const StepTwo = ({ type, accessId, newUser }) => {
  const { availableTickets, selectedTickets, setSelectedTickets } = useMyTicketContext();

  const [data, setData] = useState<any>(null);

  const totalAvailables = availableTickets?.length || 0;
  const usadas = selectedTickets?.length || 0;
  const restantes = totalAvailables - usadas;

  // ➕ Agregar un ticket (usar el siguiente ID disponible)
  const increment = () => {
    if (usadas < totalAvailables) {
      const nextId = availableTickets[usadas]; // Tomamos el siguiente ID
      setSelectedTickets([...selectedTickets, nextId]);
    }
  };

  // ➖ Quitar el último ticket seleccionado
  const decrement = () => {
    if (usadas > 1) {
      setSelectedTickets(selectedTickets.slice(0, -1));
    }
  };

  const fetchData = async () => {
    const res = await fetch(`${API_BASE_URL}/accesses/${accessId}/catalog-item`, {
      method: 'GET',
      cache: 'no-store',
      credentials: credentialsOption,
    });

    if (!res.ok) throw new Error('Error obteniendo acceso');

    const response = await res.json();
    setData(response.item);
  };

  // Inicializar: colocar el primer ticket disponible
  useEffect(() => {
    fetchData();
    if (availableTickets?.length > 0) {
      setSelectedTickets([availableTickets[0]]);
    }
  }, [availableTickets]);

  return (
    <section className="flex flex-col w-full items-center gap-y-3 font-headline">
      {/* Ticket Info Card */}
      <article className="flex flex-col gap-y-2 bg-background rounded-xl shadow p-4 w-full">
        <div className="w-full flex gap-4">
          <h6 className="text-lg text-primary font-medium">{data?.name}</h6>
        </div>
      {
        type === 'transfer' &&    <article className="flex w-full h-16 bg-dark justify-between items-center rounded-lg px-4 py-2">
          <div>
            <header className="text-sm">Cant. de Tickets</header>
            <p className="text-sm text-primary">{restantes} restantes</p>
          </div>

          {/* Contador */}
          <div className="bg-primary/10 flex justify-around items-center px-3 py-1.5 rounded-lg gap-x-4">
            <button
              type="button"
              onClick={decrement}
              disabled={usadas <= 1}
              className="text-2xl font-bold disabled:opacity-30"
            >
              <Image src="/icons/minus.svg" alt="minus" width={18} height={18} />
            </button>

            <span className="text-primary text-lg">{usadas}</span>

            <button
              type="button"
              onClick={increment}
              disabled={usadas >= totalAvailables}
              className="text-2xl font-bold disabled:opacity-30"
            >
              <Image src="/icons/add.svg" alt="plus" width={18} height={18} />
            </button>
          </div>
        </article>
      }
     
      </article>

      <Image src="/icons/arrow-down-large.svg" width={15} height={15} alt="Arrow down" />

      {/* User Info */}
      <article className="flex gap-4 bg-background rounded-xl shadow p-4 w-full">
        <Avatar className="h-10 w-10">
          <AvatarImage src={newUser?.photo} alt={newUser?.name} />
          <AvatarFallback>
            <UserCircle className="h-full w-full text-primary" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-y-1">
          <h3 className="text-base font-semibold">{newUser?.name}</h3>
          <h6 className="text-sm">{newUser?.alias}</h6>
          <h6 className="text-sm">{newUser?.email}</h6>
        </div>
      </article>
    </section>
  );
};

export default StepTwo;
