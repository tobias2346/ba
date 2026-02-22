'use client'

import modalFeedbackReact from '@/components/shared/feedback-modal';
import { API_BASE_URL, credentialsOption } from '@/services/enviroment';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { useMyTicketContext } from '../../context/my-ticketsContext';

interface AssignedUser {
  photo?: string;
  name?: string;
}

interface TicketProps {
  type: "list" | "ticket";     // ← AQUI DEFINES EL TIPO
  name: string;
  id: string;
  isOwner?: boolean;
  photo: string;
  batch?: string;
  event?: string;
  status?: string;
  seatCode?: string | null;
  assignedUser: AssignedUser;
  fetchData: () => void;
}

const Ticket = ({
  type,
  fetchData,
  assignedUser,
  id,
  isOwner,
  status,
  seatCode = null,
}: TicketProps) => {

  const router = useRouter();
  const pathName = usePathname();

  // Solo el tipo "ticket" usa este contexto
  const { setSeat } = useMyTicketContext();

  const handleNavigate = async () => {
    // Si ya hay usuario → desvincular
    if (assignedUser?.name) {
      const description =
        type === "list"
          ? `Desvincularás a ${assignedUser.name} de la lista y este no tendrá acceso`
          : `Desvincularás a ${assignedUser.name} y este no tendrá acceso al evento`;

      modalFeedbackReact(
        "Desvincular usuario",
        description,
        "warning",
        true,
        [
          {
            text: "Desvincular",
            action: async () => {
              const res = await fetch(`${API_BASE_URL}/accesses/${id}`, {
                method: 'DELETE',
                cache: "no-store",
                credentials: credentialsOption,
              });

              if (!res.ok) {
                toast.error("Error al desvincular al usuario");
                return;
              }

              toast.success("Usuario desvinculado con éxito");
              fetchData();
            },
            type: "primary",
          }
        ]
      );

      return;
    }

    // Si no tiene assignedUser → navegar
    if (type === "ticket" && seatCode) {
      setSeat(seatCode);
    }

    router.push(`${pathName}/${id}`);
  };

  // Label unificado según tipo
  const fallbackName =
    assignedUser?.name ||
    (type === "ticket"
      ? (status === "used" ? "Invitado" : "Disponible")
      : "Disponible");

  return (
    <div className="w-full h-14 bg-background rounded-xl flex items-center justify-between px-3 transition-all duration-200 hover:bg-background/80">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={assignedUser?.photo as string}
            className="rounded-full"
            alt={fallbackName}
          />
          <AvatarFallback>
            <div className="w-10 h-10 border-2 border-secondary bg-secondary/60 rounded-full"></div>
          </AvatarFallback>
        </Avatar>

        <h4 className="font-headline">
          {fallbackName} {seatCode && `( ${seatCode} )`}
        </h4>
      </div>

      {status === 'used' ? (
        <div className="px-2 py-1 bg-primary text-light rounded font-medium">
          Usado
        </div>
      ) : (
        isOwner && (
          <button
            type="button"
            onClick={handleNavigate}
            className="p-2 rounded-full hover:bg-slate-700 transition-all duration-300 hover:scale-110"
          >
            <Image
              src={assignedUser?.name ? '/icons/trash.svg' : '/icons/plus-circle.svg'}
              width={30}
              height={30}
              alt="action"
            />
          </button>
        )
      )}
    </div>
  );
};

export default Ticket;
