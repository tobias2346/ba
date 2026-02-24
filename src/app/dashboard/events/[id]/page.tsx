"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Link as LinkIcon, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventHeader } from "@/components/dashboard/events/event-header";
import { EventGeneralTab } from "@/components/dashboard/events/event-general-tab";
import { EventParticipantsTab } from "@/components/dashboard/events/event-participants-tab";
import { EventListsTab } from "@/components/dashboard/events/event-lists-tab";
import { Button } from "@/components/ui/button";
import { VerifyEventModal } from "@/components/dashboard/events/verify-event-modal";
import { useEvents } from "@/contexts/events-context";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { EventRrppTab } from "@/components/dashboard/events/event-rrpp-tab";
import { useAccesses } from "@/contexts/accesses-context";
import { toast } from "sonner";
import AccessModal from "./access-modal";

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { getEventById, verifyEvent, updateEvent } = useEvents();
  const {
    participants,
    loading: loadingParticipants,
    getParticipants,
  } = useAccesses();

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [openAccessControl, setOpenAccessControl] = useState(false);

  // Estado para lazy-loading
  const [currentTab, setCurrentTab] = useState("general");
  const [participantsLoaded, setParticipantsLoaded] = useState(false);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    const data = await getEventById(id);

    if (data) {
      setEventData(data);
    }

    setLoading(false);
  }, [id, getEventById]);

  const refreshEventData = useCallback(async () => {
    const data = await getEventById(id);
    if (data) {
      setEventData(data);
    }
  }, [id, getEventById]);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id, fetchEvent]);

  // 🔥 Lazy Loading de Participantes
  useEffect(() => {
    if (currentTab === "participants" && !participantsLoaded) {
      getParticipants(id);
      setParticipantsLoaded(true);
    }
  }, [currentTab, participantsLoaded, getParticipants, id]);

  const handleUpdateEvent = useCallback(
    async (data: any) => {
      const updated = await updateEvent(id, data);
      if (updated) setEventData(updated);
    },
    [id, updateEvent]
  );

  const handleVerificationSave = async (data: any) => {
    const payload = {
      carouselId: data.carouselId,
      verified: data.verified,
      onHome: data.onHome,
      trending: data.trending,
      bannerFile: data.banner,
    };

    const updatedEvent = await verifyEvent(id, payload);

    if (updatedEvent) {
      setEventData((prev) => ({ ...prev, ...updatedEvent }));
      setIsVerifyModalOpen(false);
    }
  };

  const handleCopyLink = () => {
    const eventUrl = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(eventUrl);
    toast.success("Link del evento copiado al portapapeles");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!eventData) return <div>Evento no encontrado</div>;
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Listado de Eventos
          </Link>

          <Button
            variant="outline"
            type="button"
            className="bg-light text-primary shadow-xl border-none hover:bg-primary/30"
            onClick={() => setOpenAccessControl(true)}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Control de acceso
          </Button>
        </div>

        <EventHeader
          eventData={eventData}
          onVerify={() => setIsVerifyModalOpen(true)}
        />

        <div>
          <Tabs
            defaultValue="general"
            className="w-full"
            onValueChange={setCurrentTab}
          >
            <div className="flex items-center justify-between border-b border-secondary">
              <TabsList className="w-80 md:w-full flex flex-nowrap items-center justify-start overflow-x-auto overflow-y-hidden gap-2 p-1 md:justify-start scrollbar-hide ">
                <TabsTrigger className="hover:bg-primary/40" value="general">Boletería</TabsTrigger>
                <TabsTrigger className="hover:bg-primary/40" value="participants">Participantes</TabsTrigger>
                <TabsTrigger className="hover:bg-primary/40" value="lists">Listas de Invitados</TabsTrigger>
                <TabsTrigger className="hover:bg-primary/40" value="rrpp">RRPP</TabsTrigger>
              </TabsList>

              <Button
                variant="link"
                className="text-primary"
                onClick={handleCopyLink}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Link del Evento
              </Button>
            </div>

            <TabsContent value="general">
              <EventGeneralTab
                eventData={eventData}
                onUpdate={handleUpdateEvent}
                onRefresh={refreshEventData}
              />
            </TabsContent>

            <TabsContent value="participants">
              <EventParticipantsTab
                participants={participants}
                loading={loadingParticipants}
              />
            </TabsContent>

            <TabsContent value="lists">
              <EventListsTab eventData={eventData} />
            </TabsContent>

            <TabsContent value="rrpp">
              <EventRrppTab storeId={eventData.store?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AccessModal
        open={openAccessControl}
        setOpen={setOpenAccessControl}
        id={id}
        eventData={eventData}
      />

      <VerifyEventModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSave={handleVerificationSave}
        initialData={eventData}
      />
    </>
  );
}
