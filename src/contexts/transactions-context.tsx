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

interface Transaction {
  id: string;
  provider: "stripe" | "mercadopago" | "mp";
  status:
    | "approved"
    | "pending"
    | "rejected"
    | "refunded"
    | "cancelled"
    | "expired";
  total: number;
  createdAt: string;
  event?: { name: string };
  user?: { name: string };
  [key: string]: any;
}

interface PaginationInfo {
  totalDocs: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}

interface GetTransactionsParams {
  storeId?: string;
  month?: string;
  year?: string;
  eventId?: string;
  status?: string;
  provider?: string;
  rrppId?: string;
  search?: string;
  cursor?: string | null;
}

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  pagination: PaginationInfo;
  getTransactions: (params: GetTransactionsParams) => Promise<void>;
  getTransactionById: (tid: string) => Promise<Transaction | null>;
  refundTransaction: (
    tid: string,
    type: "total" | "partial",
  ) => Promise<boolean>;
  exportTransactionsXlsx: (
    params: Omit<GetTransactionsParams, "cursor">,
  ) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined,
);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalDocs: 0,
    hasNextPage: true,
    nextCursor: null,
  });

  const getTransactions = useCallback(
    async (params: GetTransactionsParams = {}) => {
      if (!params.cursor) {
        setLoading(true);
      }
      try {
        const url = new URL(`${API_BASE_URL}/transactions`);
        if (params.storeId && params.storeId !== "all")
          url.searchParams.append("storeId", params.storeId);
        if (params.month && params.month !== "all")
          url.searchParams.append("month", params.month);
        if (params.year) url.searchParams.append("year", params.year);
        if (params.eventId && params.eventId !== "all")
          url.searchParams.append("eventId", params.eventId);
        if (params.status) url.searchParams.append("status", params.status);
        if (params.provider)
          url.searchParams.append("provider", params.provider);
        if (params.rrppId) url.searchParams.append("rrppId", params.rrppId);
        if (params.search) url.searchParams.append("search", params.search);
        if (params.cursor)
          url.searchParams.append("cursor", encodeURIComponent(params.cursor));

        const res = await fetch(url.toString(), {
          credentials: credentialsOption,
        });
        if (!res.ok) throw new Error("Error obteniendo transacciones");

        const data = await res.json();
        setTransactions((prev) =>
          params.cursor ? [...prev, ...data.docs] : data.docs,
        );
        setPagination({
          totalDocs: data.totalDocs,
          hasNextPage: data.hasNextPage,
          nextCursor: data.nextCursor,
        });
      } catch (error: any) {
        toast.error(error.message);
        if (!params.cursor) {
          setTransactions([]);
        }
      } finally {
        if (!params.cursor) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const getTransactionById = useCallback(async (tid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${tid}`, {
        credentials: credentialsOption,
      });
      if (!res.ok) throw new Error("Error obteniendo la transacción");
      return await res.json();
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refundTransaction = useCallback(
    async (tid: string, type: "total" | "partial") => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/transactions/refund/${tid}?type=${type}`,
          {
            method: "POST",
            credentials: credentialsOption,
          },
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Error al procesar el reembolso",
          );
        }
        toast.success("Reembolso procesado con éxito");
        return true;
      } catch (error: any) {
        toast.error(error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const exportTransactionsXlsx = useCallback(
    async (params: Omit<GetTransactionsParams, "cursor">) => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/transactions/export/xlsx`);
        if (params.storeId && params.storeId !== "all")
          url.searchParams.append("storeId", params.storeId);
        if (params.eventId && params.eventId !== "all")
          url.searchParams.append("eventId", params.eventId);
        if (params.status) url.searchParams.append("status", params.status);
        if (params.provider)
          url.searchParams.append("provider", params.provider);
        if (params.rrppId) url.searchParams.append("rrppId", params.rrppId);
        if (params.month && params.month !== "all")
          url.searchParams.append("month", params.month);
        if (params.year) url.searchParams.append("year", params.year);
        if (params.search) url.searchParams.append("search", params.search);

        const response = await fetch(url.toString(), {
          method: "POST",
          credentials: credentialsOption,
        });
        if (!response.ok) {
          throw new Error("Error al exportar las transacciones");
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "transacciones.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error: any) {
        toast.error(error.message || "No se pudo completar la exportación.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const value = {
    transactions,
    loading,
    pagination,
    getTransactions,
    getTransactionById,
    refundTransaction,
    exportTransactionsXlsx,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider",
    );
  }
  return context;
};
