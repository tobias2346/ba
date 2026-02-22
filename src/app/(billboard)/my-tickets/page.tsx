"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventCard } from "@/components/shared/event-card";
import { API_BASE_URL, credentialsOption } from "@/services/enviroment";
import Loading from "./loading";
import { useUser } from "@/contexts/user-context";
import { useUI } from "@/contexts/ui-context";
import { CompleteProfileModal } from "@/components/auth/complete-profile-modal";

type EventData = {
  id: string;
};

type EventGroup = {
  eventData: EventData;
};

export default function MyTicketsClient() {
  const [events, setEvents] = useState<EventGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const { setIsProfileModalOpen, isProfileModalOpen } = useUI();
  const { user, logged, loading: userLoading } = useUser();
  const router = useRouter();

  const cerrar = () => {
    router.push("/");
    setIsProfileModalOpen(false);
  };

  useEffect(() => {
    if (!userLoading && !logged) {
      router.push('/login');
      return;
    }
  }, [userLoading, logged, router]);

  useEffect(() => {
    // Abrir/cerrar modal de perfil según estado del usuario
    if (logged) {
      setIsProfileModalOpen(user?.completed === false);
    }
  }, [logged, user?.completed, setIsProfileModalOpen]);

  useEffect(() => {
    if (!logged) return;

    const ac = new AbortController();

    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/accesses/events`, {
          credentials: credentialsOption,
          cache: "no-store",
          mode: "cors",
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });

        if (!res.ok) {
          setErr(`HTTP ${res.status}`);
          setEvents([]);
          return;
        }

        const data = await res.json();
        const groups = Array.isArray(data?.events)
          ? (data.events as EventGroup[])
          : [];
        setEvents(groups);
      } catch (e: any) {
        if (ac.signal.aborted) return;
        setErr(e?.message ?? "Fallo de red");
        setEvents([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => ac.abort();
  }, [logged]);

  if (loading || userLoading) {
    return <Loading />;
  }

  const empty = !events || events.length === 0;

  return (
    <>
      <section className="flex-1 flex flex-col items-start p-8 md:p-20 gap-y-4 w-full md:my-8">
        {/* Título lo maneja el wrapper server; si preferís, podés dejarlo acá también */}
        <h4 className="text-3xl font-semibold font-headline">Mis tickets</h4>

        {err && (
          <p className="text-sm text-destructive">
            Ocurrió un error al cargar tus tickets:{" "}
            <span className="font-mono">{err}</span>
          </p>
        )}

        {empty ? (
          <div className="w-full flex flex-col justify-center items-center gap-y-4 my-8">
            <Image
              width={100}
              height={100}
              alt="Calendar"
              src="/icons/big-calendar.svg"
            />
            <p className="text-gray-500 text-lg">Todavía no tenés tickets</p>
            <Link
              href="/"
              className="px-4 py-2 font-medium rounded-lg shadow transition-colors duration-200 text-sm xl:text-base bg-primary text-black hover:bg-primary/80"
            >
              Ver partidos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-20 mb-10 w-full">
            {events.map(({ eventData }) => (
              <EventCard
                myTicket
                href={`/my-tickets/${eventData.id}`}
                key={eventData.id}
                {...eventData}
              />
            ))}
          </div>
        )}
      </section>

      <CompleteProfileModal closeFunct={cerrar} open={isProfileModalOpen} />
    </>
  );
}
