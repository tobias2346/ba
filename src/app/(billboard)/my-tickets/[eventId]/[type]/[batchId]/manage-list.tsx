'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Ticket from './ticket'
import { useUser } from '@/contexts/user-context'
import { API_BASE_URL, credentialsOption } from '@/services/enviroment'
import { useParams, useRouter } from 'next/navigation'
import ManageLoading from '../../[type]/[batchId]/manage-loading'
import CommonButton from '@/components/common/common-button'
import ModalSelector from './add-modal/modal-selector'
import { useMyTicketContext } from '../../context/my-ticketsContext'
import ViewUsers from './view-modal/view-users'

const ManageList = () => {
  const params = useParams();
  const router = useRouter();
  const { event } = useMyTicketContext();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(false);
  const [users, setUsers] = useState({ guests: [], list: {} });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/accesses/events/${params.eventId}/batches/${params.batchId}`, {
        cache: "no-store",
        credentials: credentialsOption
      });

      if (!res.ok) throw new Error("Error obteniendo los e");

      const response = await res.json();
      setData(response);

    } catch (error) {
      console.error(error);
      router.back();
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/lists/${params.batchId}/details`, {
        method: 'GET',
        cache: "no-store",
        credentials: credentialsOption
      });

      if (!res.ok) throw new Error("Error obteniendo los e");

      const response = await res.json();
      setUsers(response);

    } catch (error) {
      console.error(error);
      router.back();
    }
  }

  const { user, loading } = useUser();

  const isOwner = data?.accesses?.some(i => i.ownerId === user?.id);
  const hasTicket = data?.accesses?.find(i => i.assignedUser?.id === user?.id);
  const isPublic = isOwner || !users.list.private;

  useEffect(() => {
    fetchData();
    fetchUsers();
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
              <Ticket type='list' fetchData={fetchData} batch={params.batchId} event={params.eventId} {...hasTicket} isOwner={false} seatCode={hasTicket.seatCode} />
            </div>
          )}

          {isPublic && (
            <div className="w-full md:w-96 bg-secondary rounded-lg flex flex-col gap-2 p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 my-2">
                <div className="flex items-center gap-x-4">
                  <Image src='/icons/users.svg' width={30} height={30} alt="users" />
                  <h4 className="font-medium text-lg">Gestionar tickets</h4>
                </div>

                {isOwner && (
                  <div className='px-3 py-1 bg-dark/40 text-sm rounded text-slate-300 font-semibold'>
                    {users?.list?.capacity?.used} de {users?.list?.capacity?.base} disponibles
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 my-2">
                {isOwner && (
                  <CommonButton type='ghost' text='Asignar usuarios' action={() => setOpen(true)} />
                )}
                <CommonButton type='primary' text='Ver asignados' action={() => setView(true)} />
              </div>
            </div>
          )}
        </>
      ) : <ManageLoading />}

      <ModalSelector fetchUsers={fetchUsers} open={open} setOpen={setOpen} />
      <ViewUsers eventData={event} isOwner={isOwner} fetchUsers={fetchUsers} users={users.guests} open={view} setOpen={setView} />
    </>
  );
}

export default ManageList;
