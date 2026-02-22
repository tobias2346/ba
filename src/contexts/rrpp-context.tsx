"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { toast } from "sonner";

const entorno = process.env.NEXT_PUBLIC_ENTORNO;
const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;
const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";

export interface RRPPEvent {
  eventId: string;
  commisions: {
    ticketPercent: number;
    combosPercent: number;
    discount: number;
  };
  enabled: boolean;
  link: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RRPP {
  id: string;
  userId: string;
  name?: string;
  lastName?: string;
  email?: string;
  enabled: boolean;
  deleted: boolean;
  stores: string[];
  events: RRPPEvent[];
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

export interface CreateRRPPPayload {
  userId: string;
  stores: string[];
}

export interface UpdateRRPPPayload {
  stores?: string[];
  status?: "enabled" | "disabled";
  enabled?: boolean;
}

export interface GetRRPPsParams {
  storeId?: string | null;
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export type Paginated<T> = {
  docs: T[];
  total?: number;
  page?: number;
  pages?: number;
  limit?: number;
};

export interface ValidateRRPPResult {
  id: string;
  userId: string;
  eventId: string;
  code: string;
  discount: number;
}

export interface ResolvedRRPPDoc {
  id: string;
  userId: string;
  name?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
  deleted?: boolean;
  stores?: string[];
  events?: RRPPEvent[];
  [k: string]: any;
}

interface RRPPContextType {
  rrpps: RRPP[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  } | null;

  getRRPPs: (params?: GetRRPPsParams) => Promise<void>;
  getRRPPById: (id: string) => Promise<RRPP | null>;
  getRRPPByUserId: (
    userId: string,
    opts?: { includeDeleted?: boolean }
  ) => Promise<RRPP | null>;
  getRRPPsByEventId: (
    eventId: string,
    opts?: {
      includeDeleted?: boolean;
      onlyEnabled?: boolean;
      onlyMatchedEvent?: boolean;
    }
  ) => Promise<RRPP[]>;
  getRRPPsByStoreId: (
    storeId: string,
    opts?: {
      includeDeleted?: boolean;
      onlyEnabled?: boolean;
      onlyMatchedStore?: boolean;
    }
  ) => Promise<RRPP[]>;

  createRRPP: (payload: CreateRRPPPayload) => Promise<RRPP | null>;
  updateRRPP: (id: string, payload: UpdateRRPPPayload) => Promise<RRPP | null>;
  deleteRRPP: (id: string, storeId: string) => Promise<boolean>;
  liquidRRPP: (rrppId: string, startDate: string, endDate: string) => Promise<boolean>;
  upsertRRPPStores: (
    userId: string,
    storeIds: string[]
  ) => Promise<RRPP | null>;
  upsertRRPPEevents: (
    userId: string,
    events: Array<{
      eventId: string;
      code?: string;
      enabled?: boolean;
      commisions?: any;
      commissions?: any;
    }>
  ) => Promise<RRPP | null>;
  toggleRRPPEnabled: (id: string, enabled: boolean) => Promise<RRPP | null>;
  validateRRPPCode: (
    eventId: string,
    code: string
  ) => Promise<ValidateRRPPResult | null>;
  resolveRRPPToken: (token: string) => Promise<ResolvedRRPPDoc | null>;
  getActiveRRPP: (eventId: string) => Promise<ResolvedRRPPDoc | null>;
}

const RRPPContext = createContext<RRPPContextType | undefined>(undefined);

export const RRPPProvider = ({ children }: { children: ReactNode }) => {
  const [rrpps, setRRPPs] = useState<RRPP[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<RRPPContextType["pagination"]>(null);

  const getRRPPs = useCallback(async (params?: GetRRPPsParams) => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/rrpp`);
      if (params?.storeId && params.storeId !== "all")
        url.searchParams.append("storeId", params.storeId);
      if (params?.enabled !== undefined)
        url.searchParams.append("enabled", String(!!params.enabled));
      if (params?.search) url.searchParams.append("search", params.search);
      if (params?.page) url.searchParams.append("page", String(params.page));
      if (params?.limit) url.searchParams.append("limit", String(params.limit));

      const res = await fetch(url.toString(), {
        credentials: credentialsOption,
      });
      if (!res.ok) throw new Error("Error obteniendo RRPP");
      const data = await res.json();

      const list: RRPP[] = Array.isArray(data)
        ? data
        : (data.docs as RRPP[]) ?? [];
      setRRPPs(list);

      if (!Array.isArray(data)) {
        const {
          total = list.length,
          page = 1,
          pages = 1,
          limit = list.length,
        } = data as Paginated<RRPP>;
        setPagination({ total, page, pages, limit });
      } else {
        setPagination(null);
      }
    } catch (e: any) {
      toast.error(e.message || "No se pudo obtener RRPP");
      setRRPPs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRRPPById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rrpp/${id}`, {
        credentials: credentialsOption,
      });
      if (!res.ok) throw new Error("RRPP no encontrado");
      return (await res.json()) as RRPP;
    } catch (e: any) {
      toast.error(e.message || "No se pudo obtener el RRPP");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRRPPByUserId = useCallback(
    async (userId: string, opts?: { includeDeleted?: boolean }) => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/rrpp/users/${userId}`);
        if (opts?.includeDeleted !== undefined)
          url.searchParams.set("includeDeleted", String(!!opts.includeDeleted));
        const res = await fetch(url.toString(), {
          credentials: credentialsOption,
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Error obteniendo RRPP por userId");
        return (await res.json()) as RRPP;
      } catch (e: any) {
        toast.error(e.message || "No se pudo obtener RRPP por userId");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getRRPPsByEventId = useCallback(
    async (
      eventId: string,
      opts?: {
        includeDeleted?: boolean;
        onlyEnabled?: boolean;
        onlyMatchedEvent?: boolean;
      }
    ): Promise<RRPP[]> => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/rrpp/events/${eventId}`);
        if (opts?.includeDeleted !== undefined)
          url.searchParams.set("includeDeleted", String(!!opts.includeDeleted));
        if (opts?.onlyEnabled !== undefined)
          url.searchParams.set("onlyEnabled", String(!!opts.onlyEnabled));
        if (opts?.onlyMatchedEvent !== undefined)
          url.searchParams.set(
            "onlyMatchedEvent",
            String(!!opts.onlyMatchedEvent)
          );
        const res = await fetch(url.toString(), {
          credentials: credentialsOption,
        });
        if (!res.ok) throw new Error("Error obteniendo RRPP por eventId");
        const data = await res.json();
        return Array.isArray(data) ? (data as RRPP[]) : [];
      } catch (e: any) {
        toast.error(e.message || "No se pudo obtener RRPP por eventId");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getRRPPsByStoreId = useCallback(
    async (
      storeId: string,
      opts?: {
        includeDeleted?: boolean;
        onlyEnabled?: boolean;
        onlyMatchedStore?: boolean;
      }
    ): Promise<RRPP[]> => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/rrpp/store/${storeId}`);
        if (opts?.includeDeleted !== undefined)
          url.searchParams.set("includeDeleted", String(!!opts.includeDeleted));
        if (opts?.onlyEnabled !== undefined)
          url.searchParams.set("onlyEnabled", String(!!opts.onlyEnabled));
        if (opts?.onlyMatchedStore !== undefined)
          url.searchParams.set(
            "onlyMatchedStore",
            String(!!opts.onlyMatchedStore)
          );
        const res = await fetch(url.toString(), {
          credentials: credentialsOption,
        });
        if (!res.ok) throw new Error("Error obteniendo RRPP por storeId");
        const data = await res.json();
        return Array.isArray(data) ? (data as RRPP[]) : [];
      } catch (e: any) {
        toast.error(e.message || "No se pudo obtener RRPP por storeId");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createRRPP = useCallback(async (payload: CreateRRPPPayload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rrpp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: credentialsOption,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error creando/actualizando RRPP");
      }
      const body = await res.json();
      const created = (body.created || body.updated || body) as RRPP;
      setRRPPs((prev) => {
        const exists = prev.some((r) => r.id === created.id);
        return exists
          ? prev.map((r) => (r.id === created.id ? created : r))
          : [...prev, created];
      });
      toast.success("RRPP guardado con éxito");
      return created;
    } catch (e: any) {
      toast.error(e.message || "No se pudo guardar el RRPP");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRRPP = useCallback(
    async (id: string, payload: UpdateRRPPPayload) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/rrpp/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Error actualizando RRPP");
        }
        const updated = (await res.json()) as RRPP;
        setRRPPs((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
        );
        toast.success("RRPP actualizado con éxito");
        return updated;
      } catch (e: any) {
        toast.error(e.message || "No se pudo actualizar el RRPP");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteRRPP = useCallback(async (id: string, storeId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rrpp/${id}/store/${storeId}`, {
        method: "DELETE",
        credentials: credentialsOption,
      });
      if (!res.ok) throw new Error("Error eliminando RRPP");
      setRRPPs((prev) => prev.filter((r) => r.id !== id));
      toast.success("RRPP eliminado con éxito");
      return true;
    } catch (e: any) {
      toast.error(e.message || "No se pudo eliminar el RRPP");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const liquidRRPP = useCallback(async (id: string, startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rrpp/export/xlsx/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rrppId: id, startDate, endDate }),
        credentials: credentialsOption,
      });
      if (!res.ok) throw new Error("Error eliminando RRPP");
      setRRPPs((prev) => prev.filter((r) => r.id !== id));
      toast.success("RRPP liquidado con éxito"); const blob = await res.blob();

      // tomar filename desde Content-Disposition si viene
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename=([^;]+)/i);
      const fileName = match?.[1]?.replaceAll('"', "") || "rrpp_sales.xlsx";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (e: any) {
      toast.error("No hay transacciones para exportar en esas fechas");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertRRPPStores = useCallback(
    async (userId: string, storeIds: string[]) =>
      createRRPP({ userId, stores: storeIds }),
    [createRRPP]
  );

  const upsertRRPPEevents = useCallback(
    async (
      userId: string,
      events: Array<{
        eventId: string;
        code?: string;
        enabled?: boolean;
        commisions?: any;
        commissions?: any;
      }>
    ) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/rrpp/events`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, events }),
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Error actualizando eventos del RRPP");
        }
        const body = await res.json();
        const updated: RRPP = (body.updated || body) as RRPP;
        setRRPPs((prev) => {
          const exists = prev.some((r) => r.id === updated.id);
          return exists
            ? prev.map((r) => (r.id === updated.id ? updated : r))
            : [...prev, updated];
        });
        toast.success("Eventos de RRPP actualizados");
        return updated;
      } catch (e: any) {
        toast.error(e.message || "No se pudieron actualizar los eventos");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const toggleRRPPEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/rrpp/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled,
            status: enabled ? "enabled" : "disabled",
          }),
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Error cambiando estado del RRPP");
        }
        const updated = (await res.json()) as RRPP;
        setRRPPs((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
        );
        toast.success(enabled ? "RRPP habilitado" : "RRPP deshabilitado");
        return updated;
      } catch (e: any) {
        toast.error(e.message || "No se pudo cambiar el estado");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const validateRRPPCode = useCallback(
    async (
      eventId: string,
      code: string
    ): Promise<ValidateRRPPResult | null> => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/rrpp/validate`);
        url.searchParams.set("eventId", eventId);
        url.searchParams.set("code", code.trim());

        const res = await fetch(url.toString(), {
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Código no válido");
        }
        const data = (await res.json()) as ValidateRRPPResult;
        toast.success("Código aplicado");
        return data;
      } catch (e: any) {
        toast.error(e.message || "No se pudo validar el código");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resolveRRPPToken = useCallback(
    async (token: string): Promise<ResolvedRRPPDoc | null> => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/rrpp/resolve`);
        url.searchParams.set("token", token);
        const res = await fetch(url.toString(), {
          credentials: credentialsOption,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "No se pudo resolver el token");
        }
        return (await res.json()) as ResolvedRRPPDoc;
      } catch (e: any) {
        toast.error(e.message || "No se pudo resolver el token");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getActiveRRPP = useCallback(
    async (eventId: string): Promise<ResolvedRRPPDoc | null> => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/rrpp/resolve-active`);
        url.searchParams.set("eventId", eventId);
        const res = await fetch(url.toString(), {
          credentials: credentialsOption,
        });
        if (res.status === 204) return null;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "No se pudo obtener RRPP activo");
        }
        return (await res.json()) as ResolvedRRPPDoc;
      } catch (e: any) {
        toast.error(e.message || "No se pudo obtener RRPP activo");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = useMemo<RRPPContextType>(
    () => ({
      rrpps,
      loading,
      pagination,
      getRRPPs,
      getRRPPById,
      getRRPPByUserId,
      getRRPPsByEventId,
      getRRPPsByStoreId,
      createRRPP,
      updateRRPP,
      deleteRRPP,
      liquidRRPP,
      upsertRRPPStores,
      upsertRRPPEevents,
      toggleRRPPEnabled,
      validateRRPPCode,
      resolveRRPPToken,
      getActiveRRPP,
    }),
    [
      rrpps,
      loading,
      pagination,
      getRRPPs,
      getRRPPById,
      getRRPPByUserId,
      getRRPPsByEventId,
      getRRPPsByStoreId,
      createRRPP,
      updateRRPP,
      liquidRRPP,
      deleteRRPP,
      upsertRRPPStores,
      upsertRRPPEevents,
      toggleRRPPEnabled,
      validateRRPPCode,
      resolveRRPPToken,
      getActiveRRPP,
    ]
  );

  return <RRPPContext.Provider value={value}>{children}</RRPPContext.Provider>;
};

export const useRRPP = () => {
  const ctx = useContext(RRPPContext);
  if (ctx === undefined)
    throw new Error("useRRPP must be used within an RRPPProvider");
  return ctx;
};
