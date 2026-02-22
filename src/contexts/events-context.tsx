"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";
import type { EventFormData } from "@/app/dashboard/events/new/page";

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

interface Event {
  id: string;
  [key: string]: any;
}

interface GetEventsParams {
  storeId?: string | null;
  history?: boolean;
  canceled?: boolean;
  categoryId?: string;
  finished?: string;
}

interface EventsContextType {
  events: Event[];
  loading: boolean;
  getEvents: (params: GetEventsParams) => Promise<void>;
  getEventById: (eventId: string) => Promise<Event | null>;
  createEvent: (
    storeId: string,
    eventData: EventFormData
  ) => Promise<Event | null>;
  updateEvent: (
    eventId: string,
    eventData: Partial<EventFormData>
  ) => Promise<Event | null>;
  verifyEvent: (
    eventId: string,
    verificationData: any
  ) => Promise<Event | null>;
  addCatalogItem: (eventId: string, itemData: any) => Promise<any | null>;
  updateCatalogItem: (
    eventId: string,
    itemId: string,
    itemData: any
  ) => Promise<any | null>;
  deleteCatalogItem: (eventId: string, itemId: string) => Promise<any | null>;
  updateCatalogItemVisibility: (
    eventId: string,
    itemId: string,
    visible: boolean
  ) => Promise<any | null>;
  updateCatalogItemSoldOut: (
    eventId: string,
    itemId: string,
    soldOut: boolean
  ) => Promise<any | null>;
  updateCatalogItemNumerated: (
    eventId: string,
    itemId: string,
    numerated: boolean
  ) => Promise<any | null>;
  deleteEvent: (eventId: string, withRefund?: boolean) => Promise<boolean>;
  rescheduleEvent: (
    eventId: string,
    dates: { startDate: Date; endDate: Date }
  ) => Promise<boolean>;
  duplicateEvent: (
    eventId: string,
    catalogItems: boolean,
    list: boolean,
    rrpp: boolean,
    name: string,
    file: any
  ) => Promise<boolean>;
  listCarousels: () => Promise<any[]>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const getEvents = useCallback(async (params: GetEventsParams) => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/events`);
      if (params.storeId && params.storeId !== "all") {
        url.searchParams.append("storeId", params.storeId);
      }
      if (params.finished) url.searchParams.append("finished", "true");
      if (params.history) url.searchParams.append("history", "true");
      if (params.canceled) url.searchParams.append("canceled", "true");
      if (params.categoryId && params.categoryId !== "all")
        url.searchParams.append("category", params.categoryId);

      const response = await fetch(url.toString(), {
        credentials: credentialsOption,
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al obtener los eventos");
        } catch (e) {
          throw new Error("Error al obtener los eventos");
        }
      }
      const data = await response.json();
      setEvents(data.docs || data || []);
    } catch (error: any) {
      toast.error(error.message || "No se pudo obtener los eventos");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventById = useCallback(async (eventId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        credentials: credentialsOption,
      });
      if (!response.ok) throw new Error("Error al obtener el evento");
      return await response.json();
    } catch (e: any) {
      toast.error(e.message || "No se pudo obtener el evento");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(
    async (storeId: string, eventData: EventFormData) => {
      setLoading(true);
      try {
        let response;
        const payload: any = {
          storeId,
          name: eventData.eventName,
          description: eventData.eventDescription,
          address: eventData.address,
          startDate: eventData.dateInit?.toISOString(),
          endDate: eventData.dateEnd?.toISOString(),
          subscribersEnabled: eventData.includesMembers,
          stadiumId: eventData.stadiumId,
        };

        if (eventData.image) {
          const formData = new FormData();
          Object.keys(payload).forEach((key) => {
            if (payload[key] !== null && payload[key] !== undefined) {
              if (
                typeof payload[key] === "object" &&
                !Array.isArray(payload[key])
              ) {
                formData.append(key, JSON.stringify(payload[key]));
              } else {
                formData.append(key, payload[key]);
              }
            }
          });
          formData.append("file", eventData.image);
          response = await fetch(`${API_BASE_URL}/events`, {
            method: "POST",
            body: formData,
            credentials: credentialsOption,
          });
        } else {
          response = await fetch(`${API_BASE_URL}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: credentialsOption,
          });
        }

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al crear el evento");
          } catch (e) {
            throw new Error("Error al crear el evento");
          }
        }
        const newEvent = await response.json();
        toast.success("Evento creado con éxito");
        await getEvents({ storeId });
        return newEvent;
      } catch (error: any) {
        toast.error(error.message || "No se pudo crear el evento");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getEvents]
  );

  const updateEvent = useCallback(
    async (eventId: string, eventData: Partial<EventFormData>) => {
      setLoading(true);
      try {
        let response;
        const {
          image: flyerFile,
          eventName,
          eventDescription,
          stadiumId,
          includeStadium,
          includesMembers,
          ...rest
        } = eventData;
        const payload: any = {
          ...rest,
          name: eventName,
          description: eventDescription,
        };

        if (flyerFile) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              if (key === "dateInit")
                formData.append(
                  "startDate",
                  new Date(value as any).toISOString()
                );
              else if (key === "dateEnd")
                formData.append(
                  "endDate",
                  new Date(value as any).toISOString()
                );
              else if (typeof value === "object" && !Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, String(value));
              }
            }
          });
          formData.append("file", flyerFile);
          response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: "PUT",
            body: formData,
            credentials: credentialsOption,
          });
        } else {
          const body = {
            ...payload,
            startDate: payload.dateInit
              ? new Date(payload.dateInit).toISOString()
              : undefined,
            endDate: payload.dateEnd
              ? new Date(payload.dateEnd).toISOString()
              : undefined,
          };
          delete body.dateInit;
          delete body.dateEnd;

          response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: credentialsOption,
          });
        }

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Error al actualizar el evento"
            );
          } catch (e) {
            throw new Error("Error al actualizar el evento");
          }
        }
        const updatedEvent = await response.json();
        toast.success("Evento actualizado con éxito");
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? updatedEvent : e))
        );
        return updatedEvent;
      } catch (error: any) {
        toast.error(error.message || "No se pudo actualizar el evento");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyEvent = useCallback(
    async (eventId: string, verificationData: any) => {
      setLoading(true);
      try {
        let response;
        const { bannerFile, ...data } = verificationData;
        console.log(data)
        if (data.trending && bannerFile) {
          const formData = new FormData();
          Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
          });
          formData.append("file", bannerFile);
          console.log(formData)
          response = await fetch(`${API_BASE_URL}/events/verify/${eventId}`, {
            method: "PUT",
            body: formData,
            credentials: credentialsOption,
          });
        } else {
          console.log(data)
          response = await fetch(`${API_BASE_URL}/events/verify/${eventId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: credentialsOption,
          });
        }

        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Error al verificar el evento"
            );
          } catch (e) {
            throw new Error("Error al verificar el evento");
          }
        }

        const updatedEvent = await response.json();
        toast.success("Evento verificado con éxito");
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, ...updatedEvent } : event
          )
        );
        return updatedEvent;
      } catch (error: any) {
        toast.error(error.message || "No se pudo verificar el evento");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteEvent = useCallback(
    async (eventId: string, withRefund = false) => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/events/${eventId}`);
        if (withRefund) {
          url.searchParams.append("withRefund", "true");
        }
        const response = await fetch(url.toString(), {
          method: "DELETE",
          credentials: credentialsOption,
        });
        if (!response.ok) {
          throw new Error("Error al cancelar el evento");
        }
        toast.success("Evento cancelado con éxito");
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        return true;
      } catch (error: any) {
        toast.error(error.message || "No se pudo cancelar el evento");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rescheduleEvent = useCallback(
    async (eventId: string, dates: { startDate: Date; endDate: Date }) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/${eventId}/reprogram`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startDate: dates.startDate.toISOString(),
              endDate: dates.endDate.toISOString(),
            }),
            credentials: credentialsOption,
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Error al reprogramar el evento"
          );
        }
        const updatedEvent = await response.json();
        toast.success("Evento reprogramado con éxito");
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? updatedEvent : e))
        );
        return true;
      } catch (error: any) {
        toast.error(error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const duplicateEvent = useCallback(
    async (
      eventId: string,
      catalogItems: boolean,
      list: boolean,
      rrpp: boolean,
      image: File | null,
      name: string
    ) => {
      setLoading(true);
      try {
        let response;
        let payload;

        // Construcción del payload
        payload = { eventId, catalogItems, list, rrpp, name };
        // 🔹 Si hay imagen, usamos FormData
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          const value = payload[key];
          if (value !== null && value !== undefined) {
            if (typeof value === "object" && !Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        formData.append("file", image);

        response = await fetch(`${API_BASE_URL}/events/duplicate`, {
          method: "POST",
          body: formData,
          credentials: credentialsOption,
        });

        // Manejo de respuesta
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al duplicar el evento");
        }

        const updatedEvent = await response.json();
        toast.success("Evento duplicado con éxito");

        // Agregamos el evento a la lista existente
        setEvents((prev) => [...prev, updatedEvent]);
        return true;
      } catch (error: any) {
        console.error("Error duplicando evento:", error);
        toast.error(error.message || "Error al duplicar el evento");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addCatalogItem = useCallback(async (eventId: string, itemData: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/events/catalog/${eventId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
          credentials: credentialsOption,
        }
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Error al agregar item al catálogo"
          );
        } catch (e) {
          throw new Error("Error al agregar item al catálogo");
        }
      }
      const newItem = await response.json();
      toast.success("Ítem agregado al catálogo");
      return newItem;
    } catch (error: any) {
      toast.error(error.message || "No se pudo agregar el ítem");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCatalogItem = useCallback(
    async (eventId: string, itemId: string, itemData: any) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/catalog/${eventId}/${itemId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemData),
            credentials: credentialsOption,
          }
        );
        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al editar el Sector");
          } catch (e) {
            throw new Error("Error al editar el Sector");
          }
        }
        const updatedItem = await response.json();
        toast.success("Sector del catálogo actualizado");
        return updatedItem;
      } catch (error: any) {
        toast.error(error.message || "No se pudo editar el Sector");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCatalogItemVisibility = useCallback(
    async (eventId: string, itemId: string, visible: boolean) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/catalog/${eventId}/${itemId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visible }),
            credentials: credentialsOption,
          }
        );
        if (!response.ok) throw new Error("Error al cambiar la visibilidad");
        toast.success("Visibilidad actualizada");
        return await response.json();
      } catch (error: any) {
        toast.error(error.message || "Error al cambiar la visibilidad");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCatalogItemSoldOut = useCallback(
    async (eventId: string, itemId: string, soldOut: boolean) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/catalog/${eventId}/${itemId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ soldOut }),
            credentials: credentialsOption,
          }
        );
        if (!response.ok)
          throw new Error("Error al actualizar estado de agotado");
        toast.success("Estado de agotado actualizado");
        return await response.json();
      } catch (error: any) {
        toast.error(error.message || "Error al actualizar estado de agotado");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCatalogItemNumerated = useCallback(
    async (eventId: string, itemId: string, numerated: boolean) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/catalog/${eventId}/${itemId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numerated }),
            credentials: credentialsOption,
          }
        );
        if (!response.ok) {
          if (response.status === 422)
            throw new Error("Existe una lista asociada al sector.");
          throw new Error("Error al actualizar estado de numerado");
        }
        toast.success("Estado de numerado actualizado");
        return await response.json();
      } catch (error: any) {
        toast.error(error.message || "Error al actualizar estado de numerado");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCatalogItem = useCallback(
    async (eventId: string, itemId: string) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/catalog/${eventId}/${itemId}`,
          {
            method: "DELETE",
            credentials: credentialsOption,
          }
        );
        if (!response.ok) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar el ítem");
          } catch (e) {
            throw new Error("Error al eliminar el ítem");
          }
        }
        toast.success("Ítem del catálogo eliminado");
        return true;
      } catch (error: any) {
        toast.error(error.message || "No se pudo eliminar el ítem");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const listCarousels = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/carousels`, {
        credentials: credentialsOption,
      });
      if (!response.ok) {
        try {
          await response.json();
          throw new Error("Error al listar los carruseles");
        } catch (e) {
          throw new Error("Error al listar los carruseles");
        }
      }
      return await response.json();
    } catch (error: any) {
      toast.error(error.message || "No se pudieron obtener los carruseles");
      return [];
    }
  }, []);

  const value = {
    events,
    loading,
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    verifyEvent,
    addCatalogItem,
    updateCatalogItem,
    updateCatalogItemVisibility,
    updateCatalogItemSoldOut,
    updateCatalogItemNumerated,
    deleteCatalogItem,
    deleteEvent,
    rescheduleEvent,
    listCarousels,
    duplicateEvent,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
