
'use client';

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, CalendarSearch, CheckCircle, XCircle, Edit, Trash2, CalendarClock, Users, Repeat } from "lucide-react"
import { ClubFilter } from "@/components/dashboard/club-filter";
import { useUser } from "@/contexts/user-context";
import { VerifyEventModal } from "@/components/dashboard/events/verify-event-modal";
import { useEvents } from "@/contexts/events-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useStores } from "@/contexts/stores-context";
import { useRouter } from "next/navigation";
import { format, parseISO, isValid, parse } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CancelEventModal } from "@/components/dashboard/events/cancel-event-modal";
import { RescheduleEventModal } from "@/components/dashboard/events/reschedule-event-modal";
import { DuplicarEventModal } from "@/components/dashboard/events/duplicar-event-modal";

type EventType = {
  id: string;
  name: string;
  state: 'activo' | 'finalizado' | 'borrador' | 'unverified' | 'not started' | 'in progress' | 'ended' | string;
  onBillboard: boolean;
  onHome: boolean;
  totalPeople: number;
  startDate: string;
  endDate: string;
  verified?: boolean;
  trending?: boolean;
  carouselId?: string | null;
  [key: string]: any;
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch ((status || '').toLowerCase()) {
    case 'activo':
    case 'in progress':
      return 'default';
    case 'finalizado':
    case 'ended':
    case 'finished':
      return 'secondary';
    case 'not started':
    case 'borrador':
    case 'soon':
      return 'outline';
    case 'unverified':
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const translateStatus = (status: string): string => {
  const lowerCaseStatus = (status || '').toLowerCase();
  switch (lowerCaseStatus) {
    case 'unverified': return 'Sin verificar';
    case 'not started': return 'Sin iniciar';
    case 'in progress': return 'En curso';
    case 'ended': return 'Finalizado';
    case 'activo': return 'Activo';
    case 'finalizado': return 'Finalizado';
    case 'soon': return 'Próximamente';
    case 'finished': return 'Finalizado';
    case 'canceled': return 'Cancelado';
    default: return status;
  }
}

export default function EventsListPage() {
  const { user } = useUser();
  const { events, loading, getEvents, verifyEvent, deleteEvent, rescheduleEvent, duplicateEvent } = useEvents();
  const { selectedClub, setSelectedClub, canUserManageMultipleStores, categories, getCategories } = useStores();

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [openRepeatModal, setOpenRepeatModal] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const [filters, setFilters] = useState({
    history: false,
    canceled: false,
    categoryId: 'all',
  });

  const router = useRouter();

  const canVerify = user?.role === 'super-admin' || user?.role === 'admin';
  const isCreateDisabled = canUserManageMultipleStores && selectedClub === 'all';

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (selectedClub === "loading") return;

    // Manager con una sola tienda NO debe ver "all"
    if (!canUserManageMultipleStores && selectedClub === "all") return;

    getEvents({
      storeId: selectedClub,
      history: filters.history,
      canceled: filters.canceled,
      categoryId: filters.categoryId
    });
  }, [selectedClub, filters, getEvents, canUserManageMultipleStores]);

  const handleOpenVerifyModal = (event: EventType) => {
    setSelectedEvent(event);
    setIsVerifyModalOpen(true);
  };

  const handleOpenCancelModal = (event: EventType) => {
    setSelectedEvent(event);
    setIsCancelModalOpen(true);
  };

  const handleOpenRescheduleModal = (event: EventType) => {
    setSelectedEvent(event);
    setIsRescheduleModalOpen(true);
  }

  const handleVerificationSave = async (data: any) => {
    if (!selectedEvent) return;
    const payload = {
      carouselId: data.carouselId,
      verified: data.verified,
      onHome: data.onHome,
      trending: data.trending,
      bannerFile: data.banner,
    };

    const updatedEvent = await verifyEvent(selectedEvent.id, payload);

    if (updatedEvent) {
      setIsVerifyModalOpen(false);
      setSelectedEvent(null);
      getEvents({ storeId: selectedClub, ...filters });
    }
  }

  const handleCreateClick = () => {
    if (!isCreateDisabled) {
      router.push(`/dashboard/events/new?storeId=${selectedClub}`);
    }
  };

  const handleEditClick = (event: EventType) => {
    router.push(`/dashboard/events/new?id=${event.id}`);
  };

  const handleRowClick = (event: EventType) => {
    router.push(`/dashboard/events/${event.id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    let date = parseISO(dateString); // Intenta parsear como ISO 8601

    if (!isValid(date)) {
      date = parse(dateString, 'dd/MM/yyyy HH:mm', new Date());
    }

    if (!isValid(date)) {
      date = parse(dateString, 'dd/MM/yyyy', new Date());
    }

    if (!isValid(date)) {
      return 'N/A';
    }

    return format(date, "dd/MM/yyyy HH:mm");
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirmCancel = async (withRefund: boolean) => {
    if (!selectedEvent) return;
    const success = await deleteEvent(selectedEvent.id, withRefund);
    if (success) {
      setIsCancelModalOpen(false);
      setSelectedEvent(null);
    }
  }

  const handleReschedule = async (dates: { startDate: Date, endDate: Date }) => {
    if (!selectedEvent) return;
    const success = await rescheduleEvent(selectedEvent.id, dates);
    if (success) {
      setIsRescheduleModalOpen(false);
      setSelectedEvent(null);
      getEvents({ storeId: selectedClub, ...filters });
    }
  };

  const handleDuplicated = async (catalogItem: boolean, list: boolean, rrpp: boolean, name: string, file: any) => {
    if (!selectedEvent) return;
    const success = await duplicateEvent(selectedEvent.id, catalogItem, list, rrpp, name, file);
    if (success) {
      setOpenRepeatModal(false)
    }
  };

  const typedEvents: EventType[] = (events as unknown as EventType[]) ?? [];

  return (
    <>
      <Card className="border-none bg-light text-primary shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-x-4">
            <CardTitle>Partidos</CardTitle>
            <span className="font-semibold text-primary text-lg bg-primary/20 rounded-2xl flex justify-center items-center w-12 h-7">
              {typedEvents.length}
            </span>
          </div>

          <Button onClick={handleCreateClick} disabled={isCreateDisabled}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo 

            <span className="hidden md:block ml-1 ">
            Partido

            </span>
          </Button>
        </CardHeader>

        <div className="px-6">
          <Tabs
            defaultValue="active"
            onValueChange={(value) => handleFilterChange('history', value === 'history')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <ClubFilter selectedClub={selectedClub} onSelectedClubChange={setSelectedClub} />
            <Select value={filters.categoryId} onValueChange={(val) => handleFilterChange('categoryId', val)} className="border-none">
              <SelectTrigger className="w-[180px] border-none bg-light text-primary shadow-xl">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-canceled"
                checked={filters.canceled}
                onCheckedChange={(checked) => handleFilterChange('canceled', Boolean(checked))}
              />
              <Label htmlFor="show-canceled">Ver cancelados</Label>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : typedEvents.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none  rounded-xl bg-dark/60">
                      <TableHead>Nombre</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">En Cartelera</TableHead>
                      <TableHead className="text-center">En Home</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typedEvents.map((event: EventType) => (
                      <TableRow key={event.id} className="hover:bg-muted/50 hover:bg-primary/10 border-none" onClick={() => handleRowClick(event)}>
                        <TableCell className="font-medium">
                          {event.name || 'Sin nombre'}
                        </TableCell>

                        <TableCell>
                          <Badge variant={getStatusVariant(event.state)}>
                            {translateStatus(event.state)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          {event.onBillboard ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          {event.onHome ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>

                        <TableCell>
                          {formatDate(event.startDate)}
                        </TableCell>

                        <TableCell>
                          {formatDate(event.endDate)}
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-none" align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => handleEditClick(event)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedEvent(event), setOpenRepeatModal(true) }}>
                                <Repeat className="mr-2 h-4 w-4" /> Duplicar evento
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleOpenRescheduleModal(event)}>
                                <CalendarClock className="mr-2 h-4 w-4" /> Reprogramar Evento
                              </DropdownMenuItem>

                              {canVerify && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleOpenVerifyModal(event)}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Verificar
                                  </DropdownMenuItem>
                                </>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleOpenCancelModal(event)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancelar Evento
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-4 md:hidden">
                {typedEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="border-none bg-light text-primary shadow-xl"
                    onClick={() => handleRowClick(event)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {event.name || "Sin nombre"}
                          </p>
                          {/* <Badge
                            variant={getStatusVariant(event.state)}
                            className="mt-1"
                          >
                            {translateStatus(event.state)}
                          </Badge> */}
                        </div>

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
                            className="bg-secondary border-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditClick(event)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEvent(event);
                                setOpenRepeatModal(true);
                              }}
                            >
                              <Repeat className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                handleOpenRescheduleModal(event)
                              }
                            >
                              <CalendarClock className="mr-2 h-4 w-4" />
                              Reprogramar
                            </DropdownMenuItem>

                            {canVerify && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenVerifyModal(event)
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Verificar
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                handleOpenCancelModal(event)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="text-sm space-y-3">
                        <div className="flex justify-between">
                          <span>En Cartelera</span>
                          {event.onBillboard ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        <div className="flex justify-between">
                          <span>En Home</span>
                          {event.onHome ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        <span>
                          <b>Inicio:</b> {formatDate(event.startDate)}
                        </span>
                        <span>
                          <b>Fin:</b> {formatDate(event.endDate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
              <CalendarSearch className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-semibold text-muted-foreground">No hay eventos para mostrar.</p>
              {!filters.history && (
                <Button className="mt-6" onClick={handleCreateClick} disabled={isCreateDisabled}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear tu primer partido
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {canVerify && (
        <VerifyEventModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          onSave={handleVerificationSave}
          initialData={selectedEvent}
        />
      )}
      <CancelEventModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={loading}
      />
      <RescheduleEventModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onConfirm={handleReschedule}
        initialData={selectedEvent}
        loading={loading}
      />
      <DuplicarEventModal
        isOpen={openRepeatModal}
        onClose={() => setOpenRepeatModal(false)}
        onConfirm={handleDuplicated}
        initialData={selectedEvent}
        loading={loading}
      />
    </>
  );
}