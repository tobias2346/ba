"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Search, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useTransactions } from "@/contexts/transactions-context";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ClubFilter } from "@/components/dashboard/club-filter";
import { useStores } from "@/contexts/stores-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/contexts/user-context";
import modalFeedbackReact from "@/components/shared/feedback-modal";
import { RefundModal } from "@/components/dashboard/transactions/refund-modal";
import { useEvents } from "@/contexts/events-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BlockLoader } from "@/components/shared/block-loader";

const getStatusVariant = (status: string) =>
({
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
  refunded: "outline",
  cancelled: "outline",
  expired: "outline",
}[status?.toLowerCase()] ?? "outline");

const translateStatus = (status: string) =>
({
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
  refunded: "Devuelto",
  cancelled: "Cancelado",
  expired: "Expirado",
}[status?.toLowerCase()] ?? status);

const providerLogos: Record<string, string> = {
  stripe: "/brands/stripe.png",
  mp: "/brands/mp.png",
};

const monthOptions = [
  { value: "all", label: "Todos los meses" },
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString()
);

const formatDate = (dateString: string | { $date: string }): string => {
  if (!dateString) return "N/A";
  const dateValue =
    typeof dateString === "object" && (dateString as any).$date
      ? (dateString as any).$date
      : dateString;

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return typeof dateValue === "string" ? dateValue : "Fecha inválida";
    }
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Fecha inválida";
  }
};

export default function TransactionsListPage() {
  const { user } = useUser();
  const {
    transactions,
    loading,
    pagination,
    getTransactions,
    exportTransactionsXlsx,
    refundTransaction,
  } = useTransactions();
  const { events, getEvents } = useEvents();
  const { selectedClub, setSelectedClub } = useStores();
  const router = useRouter();
  const [isSubmiting, setIsSubmiting] = useState(false)
  const [search, setSearch] = useState("");
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const [filters, setFilters] = useState({
    month: "all",
    year: currentYear.toString(),
    eventId: "all",
  });

  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  // ====== Params base ======
  const baseParams = useMemo(
    () => ({
      ...filters,
      storeId: selectedClub,
      search,
    }),
    [filters, selectedClub, search]
  );

  // ====== Infinite scroll robusto (root fijo: #dashboard-scroll) ======
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasUserScrolledRef = useRef(false);
  const fetchingMoreRef = useRef(false);
  const scrollElRef = useRef<HTMLElement | null>(null);

  // Tomar el scroller real del dashboard una vez
  useEffect(() => {
    scrollElRef.current = document.getElementById("dashboard-scroll");
  }, []);

  // Armar “armado” cuando el usuario scrollea (evita doble fetch al entrar)
  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollTop > 0) hasUserScrolledRef.current = true;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll as any);
  }, []);

  const loadMore = useCallback(() => {
    if (loading) return;
    if (!pagination?.hasNextPage) return;
    if (!pagination?.nextCursor) return;
    if (fetchingMoreRef.current) return;

    // CLAVE: solo paginar si el usuario realmente scrolleó
    if (!hasUserScrolledRef.current) return;

    fetchingMoreRef.current = true;

    getTransactions({
      ...baseParams,
      cursor: pagination.nextCursor,
    }).finally(() => {
      setTimeout(() => {
        fetchingMoreRef.current = false;
      }, 250);
    });
  }, [
    loading,
    pagination?.hasNextPage,
    pagination?.nextCursor,
    getTransactions,
    baseParams,
  ]);

  // IntersectionObserver con root fijo: #dashboard-scroll
  useEffect(() => {
    const rootEl = scrollElRef.current;
    const sentinel = sentinelRef.current;

    if (!rootEl || !sentinel) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) loadMore();
      },
      {
        root: rootEl,
        rootMargin: "600px 0px 600px 0px",
        threshold: 0,
      }
    );

    obs.observe(sentinel);

    return () => {
      obs.disconnect();
    };
  }, [loadMore, transactions.length]);

  // Reset flags cuando cambian filtros/búsqueda/club (evita paginar con cursor viejo)
  useEffect(() => {
    fetchingMoreRef.current = false;
    hasUserScrolledRef.current = false;
  }, [baseParams]);

  // ====== Carga inicial (debounce) ======
  useEffect(() => {
    const handler = setTimeout(() => {
      getTransactions({ ...baseParams, cursor: null });
    }, 300);
    return () => clearTimeout(handler);
  }, [baseParams, getTransactions]);

  // ====== Events por club ======
  useEffect(() => {
    if (isAdmin && selectedClub && selectedClub !== "all") {
      getEvents({ storeId: selectedClub, finished: true });
    }
    setFilters((prev) => ({ ...prev, eventId: "all" }));
  }, [selectedClub, isAdmin, getEvents]);

  // ===== Refund =====
  const handleRefundClick = (transaction: any) => {
    setSelectedTransaction(transaction);

    if (user?.role === "manager") {
      modalFeedbackReact(
        "Confirmar Reembolso",
        "Estás a punto de realizar un reembolso parcial para esta transacción. ¿Deseas continuar?",
        "warning",
        true,
        [
          {
            text: "Confirmar",
            action: () => handleRefund("partial"),
            type: "primary",
          },
        ]
      );
    } else {
      setIsRefundModalOpen(true);
    }
  };

  const handleRefund = async (type: "total" | "partial") => {
    if (!selectedTransaction) return;

    const success = await refundTransaction(selectedTransaction.id, type);

    if (success) {
      hasUserScrolledRef.current = false;
      fetchingMoreRef.current = false;
      getTransactions({ ...baseParams, cursor: null });
    }

    setIsRefundModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleRowClick = (transactionId: string) => {
    router.push(`/dashboard/transactions/${transactionId}`);
  };

  const handleCloseRefundModal = () => {
    setIsRefundModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleExport = async () => {
    setIsSubmiting(true)
    await exportTransactionsXlsx(baseParams);
    setIsSubmiting(false)
  };

  return (
    <>
      <Card className="border-none bg-secondary/20">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            <CardTitle>Transacciones</CardTitle>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <ClubFilter
                selectedClub={selectedClub}
                onSelectedClubChange={setSelectedClub}
              />

              {isAdmin && selectedClub !== "all" && (
                <Select
                  value={filters.eventId}
                  onValueChange={(v) =>
                    setFilters((p) => ({ ...p, eventId: v }))
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px] border-none bg-secondary/40">
                    <SelectValue placeholder="Evento" />
                  </SelectTrigger>
                  <SelectContent className="border-none">
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    {events
                      .filter((e) => e.state !== "ended")
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={filters.month}
                onValueChange={(v) => setFilters((p) => ({ ...p, month: v }))}
              >
                <SelectTrigger className="w-full sm:w-[150px] border-none bg-secondary/40">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent className="border-none">
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.year}
                onValueChange={(v) => setFilters((p) => ({ ...p, year: v }))}
              >
                <SelectTrigger className="w-full sm:w-[120px] border-none bg-secondary/40">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent className="border-none">
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="icon"
                variant="outline"
                onClick={handleExport}
                className="w-full sm:w-10 border-none bg-secondary/40"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente"
                className="pl-9 border-none bg-secondary/40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && transactions.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              {/* MOBILE CARDS */}
              <div className="flex flex-col gap-4 md:hidden">
                {transactions.map((trx: any) => (
                  <Card
                    key={trx.id}
                    className="border-none bg-secondary/40 cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/transactions/${trx.id}`)
                    }
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{trx.user?.name}</p>
                        <Badge variant={getStatusVariant(trx.status)}>
                          {translateStatus(trx.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trx.event?.name}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {trx.total.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border-none bg-secondary/40"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/transactions/${trx.id}`
                                );
                              }}
                            >
                              Ver Detalles
                            </DropdownMenuItem>
                            {translateStatus(trx.status) === "Aprobado" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRefundClick(trx);
                                }}
                              >
                                Realizar Devolución
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-dark/60 border-none">
                      <TableHead>Cliente</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead className="text-center">Proveedor</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((trx: any) => (
                      <TableRow
                        key={trx.id}
                        onClick={() =>
                          router.push(`/dashboard/transactions/${trx.id}`)
                        }
                        className="cursor-pointer border-none hover:bg-primary/10"
                      >
                        <TableCell>{trx.user?.name}</TableCell>
                        <TableCell>{trx.event?.name}</TableCell>
                        <TableCell className="flex justify-center">
                          {providerLogos[trx.provider?.toLowerCase()] && (
                            <Image
                              src={providerLogos[trx.provider.toLowerCase()]}
                              alt={trx.provider}
                              width={80}
                              height={20}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {trx.total.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          })}
                        </TableCell>
                        <TableCell>{trx.createdAt}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(trx.status)}>
                            {translateStatus(trx.status)}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-none" align="end">
                              <DropdownMenuItem onClick={() => handleRowClick(trx.id)}>
                                Ver Detalles
                              </DropdownMenuItem>
                              {translateStatus(trx.status) === "Aprobado" && (
                                <DropdownMenuItem onClick={() => handleRefundClick(trx)}>
                                  Realizar Devolución
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* SENTINEL ÚNICO (no depende de “último item”) */}
              <div ref={sentinelRef} className="h-1 w-full" />

              {loading && transactions.length > 0 && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={isSubmiting} onOpenChange={() => setIsSubmiting(true)}>
        <DialogTitle className="hidden"></DialogTitle>
        <DialogContent className="max-w-xs sm:max-w-sm px-4 py-10 rounded-lg border-none bg-dark">
          <BlockLoader messages={['Creando Plantilla', 'Leyendo transacciones ', 'Cargando RRPP']} />
        </DialogContent>
      </Dialog>
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={handleCloseRefundModal}
        onConfirm={(type) => handleRefund(type)}
      />
    </>
  );
}
