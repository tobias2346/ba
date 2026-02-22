"use client";
import ClubEvents from "./club-events/club-events";
import ClubData from "./club-data/club-data";
import { useEffect, useState } from "react";
import { ClubEventsLoading } from "./club-events/club-events-loading";
import { API_BASE_URL } from "@/services/enviroment";
import { toast } from "sonner";
import Image from "next/image";
import { useStores } from "@/contexts/stores-context";
import { useParams } from "next/navigation";
import EmptyClubs from "./empty-clubs";

export default function ClubDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [events, setEvents] = useState([]);
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { getStoreById } = useStores();

  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/events?storeId=${id}&billboard=true`
        );
        if (!res.ok) throw new Error("Error obteniendo eventos del club");
        const data = await res.json();
        setEvents(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchClubData = async () => {
      const data = await getStoreById(id);
      setClub(data);
    };

    if (id) {
      fetchEvents();
      fetchClubData();
    }
  }, [id, getStoreById]);

  return (
    <section
      className={`w-full flex p-4 md:p-8 justify-center gap-4 xl:container my-8`}
    >
      <div
        className={`flex flex-col gap-y-8  ${
          club?.advertisingBanner ? "w-full md:w-4/5" : "w-full"
        } `}
      >
        <ClubData club={club} />
        <h3 className="text-2xl font-semibold">Partidos del club</h3>
        <div className="w-full h-auto flex">
          {loading ? (
            <ClubEventsLoading />
          ) : events.length >= 1 ? (
            <ClubEvents data={events} />
          ) : (
            <EmptyClubs />
          )}
        </div>
      </div>
      {club?.advertisingBanner && (
        <div className="w-1/5 h-[80vh] bg-secondary rounded-xl relative hidden md:block">
          <Image
            fill
            alt="Banner"
            src={club.advertisingBanner}
            className="object-fill rounded-lg"
          />
        </div>
      )}
    </section>
  );
}
