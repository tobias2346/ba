'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Ticket from './ticket'
import { useUser } from '@/contexts/user-context'
import ManageLoading from './manage-loading'
import { API_BASE_URL, credentialsOption } from '@/services/enviroment'
import { useParams, useRouter } from 'next/navigation'
import { useMyTicketContext } from '../../context/my-ticketsContext'

const ManageTicket = () => {

  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState([]);

  const { setAvailableTickets } = useMyTicketContext()

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/accesses/events/${params.eventId}/batches/${params.batchId}`, {
        cache: "no-store",
        credentials: credentialsOption
      });

      if (!res.ok) throw new Error("Error obteniendo los e");

      const response = await res.json();
      setData(response);
      // Filtrar NO asignados
      const unassigned = response?.accesses?.filter(
        t => !t.assignedUser && t.status === 'valid' 
      );

      // Guardar solo los IDs (string[])
      setAvailableTickets(unassigned?.map(t => t.id) || []);

    } catch (error) {
      console.error(error);
      router.back();
    }
  }

  const { user, loading } = useUser();

  const isOwner = data?.accesses?.some(i => i.ownerId === user?.id);
  const hasTicket = data?.accesses?.find(i => i.assignedUser?.id === user?.id);
  const hasMorePeopleOrAvailables = data?.accesses?.filter(i =>
    i.assignedUser?.id !== user?.id || i.assignedUser?.id === ""
  );

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {!loading ? (
        <>
          {hasTicket && (
            <div className="w-full md:w-96 bg-secondary rounded-lg flex flex-col gap-4 p-4">
              <div className="flex items-center gap-2">
                <Image src='/icons/ticket.svg' width={35} height={35} alt="ticket" />
                <h4 className="font-medium text-lg">Mi ticket</h4>
              </div>
              <Ticket type='ticket' status={hasTicket.status} fetchData={fetchData} batch={params.batchId} event={params.eventId} {...hasTicket} isOwner={isOwner} />
            </div>
          )}

          {hasMorePeopleOrAvailables?.length > 0 && (
            <div className="w-full md:w-96 bg-secondary rounded-lg flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2 my-2">
                <Image src='/icons/users.svg' width={30} height={30} alt="users" />
                <h4 className="font-medium text-lg">Gestionar tickets</h4>
              </div>

              {hasMorePeopleOrAvailables.map(i => (
                <Ticket
                  type='ticket'
                  key={i.id}
                  status={i.status}
                  fetchData={fetchData}
                  {...i}
                  isOwner={isOwner}
                  seatCode={i.seatCode}
                />
              ))}
            </div>
          )}
        </>
      ) : <ManageLoading />}
    </>
  );
}

export default ManageTicket;
