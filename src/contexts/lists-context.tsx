"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

interface List {
  id: string;
  name: string;
  private: boolean;
  capacity: { base: number; used: number; aviable: number };
  [key: string]: any;
}

interface ListsContextType {
  lists: List[];
  loading: boolean;
  getListsByEvent: (eventId: string) => Promise<void>;
  getListDetails: (listId: string) => Promise<any>;
  createList: (payload: any) => Promise<boolean>;
  updateList: (listId: string, payload: any) => Promise<boolean>;
  deleteList: (listId: string) => Promise<void>;
  addGuest: (
    listId: string,
    payload: any,
    queryParams: any
  ) => Promise<boolean>;
  bulkInvite: (listId: string, eventId: string, file: File) => Promise<boolean>;
  removeGuest: (accessId: string) => Promise<boolean>;
  downloadTemplateXlsx: () => Promise<void>;
}

const ListsContext = createContext<ListsContextType | undefined>(undefined);

export const ListsProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);

  const getListsByEvent = useCallback(async (eventId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/lists/by-event/${eventId}`, {
        credentials: credentialsOption,
      });
      if (!res.ok) throw new Error("Error obteniendo las listas");
      const data = await res.json();
      setLists(data.lists || []);
    } catch (error: any) {
      toast.error(error.message);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getListDetails = useCallback(async (listId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/lists/${listId}/details`, {
        credentials: credentialsOption,
      });
      if (!res.ok) throw new Error("Error obteniendo los detalles de la lista");
      return await res.json();
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createList = useCallback(
    async (payload: any) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/lists`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error creando la lista");
        }
        toast.success("Lista creada con éxito");
        if (payload.eventId) {
          await getListsByEvent(payload.eventId);
        }
        return true;
      } catch (error: any) {
        toast.error(error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getListsByEvent]
  );

  const updateList = useCallback(
    async (listId: string, payload: any) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/lists/${listId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ capacity: payload.capacity, ...payload }),
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error actualizando la lista");
        }
        toast.success("Lista actualizada con éxito");

        const eventId = lists.find((l) => l.id === listId)?.eventId;
        if (eventId) {
          await getListsByEvent(eventId);
        }

        return true;
      } catch (error: any) {
        toast.error(error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getListsByEvent, lists]
  );

  const deleteList = useCallback(async (listId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/lists/${listId}`, {
        method: "DELETE",
        credentials: credentialsOption,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error eliminando la lista");
      }
      toast.success("Lista eliminada con éxito");
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addGuest = useCallback(
    async (listId: string, payload: any, queryParams: any) => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/lists/${listId}/invite`);
        Object.keys(queryParams).forEach((key) =>
          url.searchParams.append(key, queryParams[key])
        );

        const res = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error agregando invitado");
        }
        toast.success("Invitado agregado con éxito.");
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

  const bulkInvite = useCallback(
    async (listId: string, eventId: string, file: File) => {
      setLoading(true);
      try {
        const fd = new FormData();
        fd.append("files", file);
        fd.append("eventId", eventId);

        const res = await fetch(
          `${API_BASE_URL}/lists/${listId}/invite?CM=true`,
          {
            method: "POST",
            body: fd,
            credentials: credentialsOption,
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error en la carga masiva");
        }
        const data = await res.json();
        toast.success(`${data.added} invitados agregados con éxito.`);
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

  const removeGuest = useCallback(async (accessId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/accesses/${accessId}`, {
        method: "DELETE",
        credentials: credentialsOption,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error eliminando invitado");
      }
      toast.success("Invitado eliminado con éxito.");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadTemplateXlsx = useCallback(async (numerated: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/lists/template-xlsx${
          numerated ? "?numerated=true" : ""
        }`,
        {
          method: "GET",
          credentials: credentialsOption,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Error al descargar la plantilla"
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla_invitados.xlsx";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Plantilla descargada con éxito.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    lists,
    loading,
    getListsByEvent,
    getListDetails,
    createList,
    updateList,
    deleteList,
    addGuest,
    bulkInvite,
    removeGuest,
    downloadTemplateXlsx,
  };

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  );
};

export const useLists = () => {
  const context = useContext(ListsContext);
  if (context === undefined) {
    throw new Error("useLists must be used within a ListsProvider");
  }
  return context;
};
