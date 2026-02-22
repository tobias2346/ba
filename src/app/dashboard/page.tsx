"use client";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { Users, DollarSign, Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClubFilter } from "@/components/dashboard/club-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useEvents } from "@/contexts/events-context";
import { useStores } from "@/contexts/stores-context";
import { useUser } from "@/contexts/user-context";

export default function DashboardPage() {
  const {
    loading,
    incomesText,
    ventasText,
    suscripcionesText,
    chartData,
    recentSales,
    filters,
    setSelectedClub,
    setSelectedEvent,
    setSelectedTicket,
    fetchStats,
    setYear,
    setMonth,
  } = useDashboard();

  const {
    events,
    loading: loadingEvents,
    getEvents,
    getEventById,
  } = useEvents();

  const { displayStores, canUserManageMultipleStores } = useStores();
  const { user } = useUser();

  const roleReady = useMemo(() => Boolean(user && user.role), [user]);

  const isManager = useMemo(
    () => roleReady && user?.role === "manager",
    [roleReady, user]
  );

  useEffect(() => {
    if (!roleReady) return;

    if (isManager) {
      const managed = Array.isArray(user?.stores)
        ? user!.stores.filter(Boolean)
        : [];
      if (managed.length === 1 && filters.storeId !== managed[0]) {
        setSelectedClub(managed[0]);
      }
    } else {
      if (
        displayStores.length === 1 &&
        filters.storeId !== displayStores[0].id
      ) {
        setSelectedClub(displayStores[0].id);
      }
    }
  }, [roleReady, isManager, user, displayStores]);

  // =============================
  // TICKETS
  // =============================
  const [ticketOptions, setTicketOptions] = useState<
    { value: string; label: string; soldOut?: boolean }[]
  >([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      if (!filters.eventId || filters.eventId === "all") {
        setTicketOptions([]);
        return;
      }
      setLoadingTickets(true);
      try {
        const ev: any = await getEventById(filters.eventId);
        const raw = (ev?.catalog ?? ev?.catalogItems ?? []) as any[];
        const opts = raw
          .filter((it) => it && (it.visible ?? true))
          .map((it) => ({
            value: String(it.id ?? it.catalogItemId ?? it._id),
            label:
              it.name ??
              it.title ??
              [it.type ?? "Ticket", it.variant ?? ""].filter(Boolean).join(" "),
            soldOut: Boolean(it.soldOut),
          }));
        setTicketOptions(opts);
      } finally {
        setLoadingTickets(false);
      }
    }
    loadTickets();
  }, [filters.eventId, getEventById]);

  // =============================
  // EVENTS
  // =============================
  useEffect(() => {
    if (!roleReady) return;
    if (filters.storeId === "loading") return;
    if (!canUserManageMultipleStores && filters.storeId === "all") return;

    const params: any = { history: false, canceled: false, finished : true };

    if (filters.storeId && filters.storeId !== "all") {
      params.storeId = filters.storeId;
    }

    getEvents(params);
  }, [roleReady, filters.storeId, getEvents, canUserManageMultipleStores]);

  // =============================
  // STATS
  // =============================
  useEffect(() => {
    if (!roleReady) return;
    fetchStats();
  }, [roleReady, isManager, fetchStats]);

  // =============================
  // EVENT OPTIONS
  // =============================
  const eventOptions = useMemo(
    () =>
      (events ?? [])
        .map((ev: any) => ({
          value: ev.id,
          label: ev.title ?? ev.name ?? `Evento ${String(ev.id).slice(-6)}`,
          startDate: ev.startDate ?? ev.createdAt,
        }))
        .sort((a, b) =>
          a.startDate && b.startDate ? (a.startDate > b.startDate ? -1 : 1) : 0
        ),
    [events]
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - i);

  if (!roleReady) {
    return (
      <>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>
        Cargando...
      </>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Select value={filters.year} onValueChange={setYear}>
            <SelectTrigger className="w-full sm:w-[180px] border-none bg-secondary/40">
              <SelectValue placeholder="Filtrar por año" />
            </SelectTrigger>
            <SelectContent className="border-none bg-slate-800">
              {yearOptions.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.month} onValueChange={setMonth}>
            <SelectTrigger className="w-full sm:w-[180px] border-none bg-secondary/40">
              <SelectValue placeholder="Filtrar por mes" />
            </SelectTrigger>
            <SelectContent className="border-none bg-slate-800">
              <SelectItem value="all">Todos los meses</SelectItem>
              {[
                "Enero","Febrero","Marzo","Abril","Mayo","Junio",
                "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
              ].map((m, i) => (
                <SelectItem key={i} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ClubFilter
            selectedClub={filters.storeId}
            onSelectedClubChange={setSelectedClub}
          />

          <Select
            value={filters.eventId}
            onValueChange={setSelectedEvent}
            disabled={loadingEvents}
          >
            <SelectTrigger className="w-full sm:w-[180px] border-none bg-secondary/40">
              <SelectValue
                placeholder={
                  loadingEvents ? "Cargando..." : "Filtrar por evento"
                }
              />
            </SelectTrigger>
            <SelectContent className="border-none bg-slate-800">
              <SelectItem value="all">Todos los eventos</SelectItem>
              {eventOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.catalogItemId}
            onValueChange={setSelectedTicket}
            disabled={
              loadingEvents || loadingTickets || filters.eventId === "all"
            }
          >
            <SelectTrigger className="w-full sm:w-[180px] border-none bg-secondary/40">
              <SelectValue
                placeholder={
                  filters.eventId === "all"
                    ? "Elegí un evento"
                    : loadingTickets
                    ? "Cargando..."
                    : "Filtrar por ticket"
                }
              />
            </SelectTrigger>
            <SelectContent className="border-none bg-slate-800">
              <SelectItem value="all">Todos los tipos</SelectItem>
              {ticketOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.soldOut ? " (Agotado)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="w-full sm:w-28"
            onClick={fetchStats}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Buscar"}
          </Button>
        </div>
      </div>

      {/* ============================= */}
      {/* STATS */}
      {/* ============================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          title="Ingresos Totales"
          value={incomesText}
          description={`Año ${filters.year}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Suscripciones"
          value={`+${suscripcionesText}`}
          description="Usuarios nuevos vinculados"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Ventas"
          value={`+${ventasText}`}
          description="Transacciones aprobadas"
          icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* ============================= */}
      {/* CHARTS */}
      {/* ============================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="border-none bg-secondary/50 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-xl">Resumen de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart data={chartData} currency={filters.currency} />
          </CardContent>
        </Card>

        <Card className="border-none bg-secondary/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Ventas Recientes</CardTitle>
            <CardDescription>
              Se realizaron {ventasText} ventas en el período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales items={recentSales} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
