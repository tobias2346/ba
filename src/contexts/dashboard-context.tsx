"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { toast } from "sonner";

// === ENV & fetch options (mismo patrón que tus contexts) ===
const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

// En prod mandamos cookies; en dev omitimos (evita preflight innecesario)
const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

// ===== Tipos de respuesta del endpoint /dashboard/stats =====
export type DashboardMonth = {
  mes: string;               // "01".."12"
  totalAmount: number;       // suma de ingresos del mes
  totalCount: number;        // cantidad de ventas (tx aprobadas)
};

export type DashboardRecent = {
  id: string;
  createdAt: string;
  total: number;
  currency: string;
  buyerName?: string;
  buyerEmail?: string;
};

export type DashboardTotals = {
  totalAbsolutAmount: number;
  totalAbsolutCount: number;
  ventasCount: number;   // mismas aprobadas del período filtrado
  ingresos: number;      // suma de total del período
  suscripciones: number; // usuarios vinculados al club en el período (si hay club)
};

export type DashboardStats = {
  filtros: {
    year: string;
    month: string;
    storeId: string;
    eventId: string;
    catalogItemId: string;
    currency: string;
  };
  meses: DashboardMonth[];
  totales: DashboardTotals;
  recientes: DashboardRecent[];
};

// ===== Estado/Filtros del Dashboard =====
type DashboardFilters = {
  year: string;              // "2025"
  month: string;             // "all" | "01".."12"
  currency: "ARS" | "USD" | "EUR" | string;
  storeId: string;           // "all" | storeId
  eventId: string;           // "all" | eventId
  catalogItemId: string;     // "all" | ticketId
};

type DashboardContextType = {
  // Datos
  loading: boolean;
  stats: DashboardStats | null;

  // Filtros
  filters: DashboardFilters;
  setYear: (y: string) => void;
  setMonth: (m: string) => void;
  setCurrency: (c: DashboardFilters["currency"]) => void;
  setSelectedClub: (id: string) => void;       // storeId
  setSelectedEvent: (id: string) => void;      // eventId
  setSelectedTicket: (id: string) => void;     // catalogItemId
  setFilters: (next: Partial<DashboardFilters>) => void;

  // Acciones
  fetchStats: () => Promise<void>;

  // Derivados listos para UI
  incomesText: string;
  ventasText: string;
  suscripcionesText: string;
  chartData: { month: string; value: number }[];
  recentSales: DashboardRecent[];
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  // Filtros por defecto (año actual)
  const now = new Date();
  const [filters, setFiltersState] = useState<DashboardFilters>({
    year: String(now.getFullYear()),
    month: "all",
    currency: "ARS",
    storeId: "all",
    eventId: "all",
    catalogItemId: "all",
  });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const setYear = useCallback((y: string) => {
    setFiltersState((f) => ({ ...f, year: y || String(now.getFullYear()) }));
  }, [now]);

  const setMonth = useCallback((m: string) => {
    setFiltersState((f) => ({ ...f, month: m || "all" }));
  }, []);

  const setCurrency = useCallback(
    (c: DashboardFilters["currency"]) => {
      setFiltersState((f) => ({ ...f, currency: c || "ARS" }));
    },
    []
  );

  const setSelectedClub = useCallback((id: string) => {
    setFiltersState((f) => ({
      ...f,
      storeId: id || "all",
      // al cambiar club, reseteamos cascada
      eventId: "all",
      catalogItemId: "all",
    }));
  }, []);

  const setSelectedEvent = useCallback((id: string) => {
    setFiltersState((f) => ({
      ...f,
      eventId: id || "all",
      // al cambiar evento, reseteamos ticket
      catalogItemId: "all",
    }));
  }, []);

  const setSelectedTicket = useCallback((id: string) => {
    setFiltersState((f) => ({ ...f, catalogItemId: id || "all" }));
  }, []);

  const setFilters = useCallback((next: Partial<DashboardFilters>) => {
    setFiltersState((f) => ({ ...f, ...next }));
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/dashboard/stats`);
      url.searchParams.set("year", filters.year);
      url.searchParams.set("month", filters.month);
      url.searchParams.set("currency", filters.currency);
      if (filters.storeId && filters.storeId !== "all")
        url.searchParams.set("storeId", filters.storeId);
      if (filters.eventId && filters.eventId !== "all")
        url.searchParams.set("eventId", filters.eventId);
      if (filters.catalogItemId && filters.catalogItemId !== "all")
        url.searchParams.set("catalogItemId", filters.catalogItemId);

      const res = await fetch(url.toString(), {
        credentials: credentialsOption,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "No se pudieron cargar las estadísticas");
      }
      const data = (await res.json()) as DashboardStats;
      setStats(data);
    } catch (e: any) {
      toast.error(e.message || "Error cargando dashboard");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ======= Derivados para UI =======
  const incomesText = useMemo(() => {
    const amount = stats?.totales?.ingresos ?? 0;
    const curr = filters.currency || "ARS";
    try {
      return amount.toLocaleString("es-AR", {
        style: "currency",
        currency: curr,
        maximumFractionDigits: 2,
      });
    } catch {
      return `$${amount.toLocaleString("es-AR")}`;
    }
  }, [stats?.totales?.ingresos, filters.currency]);

  const ventasText = useMemo(
    () => String(stats?.totales?.ventasCount ?? 0),
    [stats?.totales?.ventasCount]
  );

  const suscripcionesText = useMemo(
    () => String(stats?.totales?.suscripciones ?? 0),
    [stats?.totales?.suscripciones]
  );

  const chartData = useMemo(
    () =>
      (stats?.meses ?? []).map((m) => ({
        month: m.mes,
        value: m.totalAmount,
      })),
    [stats?.meses]
  );

  const recentSales = useMemo(() => stats?.recientes ?? [], [stats?.recientes]);

  const value: DashboardContextType = {
    loading,
    stats,

    filters,
    setYear,
    setMonth,
    setCurrency,
    setSelectedClub,
    setSelectedEvent,
    setSelectedTicket,
    setFilters,

    fetchStats,

    incomesText,
    ventasText,
    suscripcionesText,
    chartData,
    recentSales,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (ctx === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
};
