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

export interface Participant {
  alias: string;
  nationality: string;
  document: string;
  name: string;
  origin: "owner" | "asigned";
  access: {
    type: string;
    name: string;
  };
  unasigned: {
    batchId: string;
    type: string;
    name: string;
    unasigned: number;
  }[];
}

export interface MyAccessSummaryItem {
  catalogItemId: string;
  quantity: number;
}

interface AccessesContextType {
  // Participantes (mantengo para backoffice)
  participants: Participant[];
  loading: boolean;
  getParticipants: (eventId: string) => Promise<void>;
  exportParticipants: (eventId: string) => Promise<void>;

  // Nuevo: resumen de accesos del usuario logueado por evento
  mySummary: MyAccessSummaryItem[];
  getMyAccessSummary: (eventId: string) => Promise<void>;
}

const AccessesContext = createContext<AccessesContextType | undefined>(
  undefined
);

export const AccessesProvider = ({ children }: { children: ReactNode }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  // === Nuevo estado para el resumen de accesos del usuario ===
  const [mySummary, setMySummary] = useState<MyAccessSummaryItem[]>([]);

  const getParticipants = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/accesses/events/${eventId}/participants`,
        { credentials: credentialsOption }
      );
      if (!res.ok) throw new Error("Error obteniendo los participantes");
      const data = await res.json();
      setParticipants(data.participants || []);
    } catch (error: any) {
      toast.error(error.message);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportParticipants = useCallback(async (eventId: string) => {
    if (!eventId) {
      toast.info("ID de evento no válido para exportar.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/accesses/events/${eventId}/participants/export`,
        {
          credentials: credentialsOption,
        }
      );
      if (!response.ok) {
        throw new Error("Error al exportar los participantes");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `participantes_${eventId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Exportación de participantes completada.");
    } catch (error: any) {
      toast.error(error.message || "No se pudo completar la exportación.");
    } finally {
      setLoading(false);
    }
  }, []);

  // === Nuevo: obtener resumen de accesos del usuario por evento
  // GET /accesses/events/:eventId/my/summary
  const getMyAccessSummary = useCallback(async (eventId: string) => {
    if (!eventId) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/accesses/events/${eventId}/my-summary`,
        {
          method: "GET",
          credentials: credentialsOption,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        console.error("Error getMyAccessSummary:", txt);
        setMySummary([]);
        return;
      }
      const data = await res.json();
      const arr: MyAccessSummaryItem[] = Array.isArray(data?.summary)
        ? data.summary
        : [];
      setMySummary(arr);
    } catch (e: any) {
      console.error("Fallo getMyAccessSummary:", e?.message || e);
      setMySummary([]);
    }
  }, []);

  const value: AccessesContextType = {
    participants,
    loading,
    getParticipants,
    exportParticipants,

    mySummary,
    getMyAccessSummary,
  };

  return (
    <AccessesContext.Provider value={value}>
      {children}
    </AccessesContext.Provider>
  );
};

export const useAccesses = () => {
  const context = useContext(AccessesContext);
  if (context === undefined) {
    throw new Error("useAccesses must be used within an AccessesProvider");
  }
  return context;
};
