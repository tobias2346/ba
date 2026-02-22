'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RrppFormModal } from './rrpp-form-modal';
import { useRRPP, type RRPP } from '@/contexts/rrpp-context';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Props = { storeId?: string };

export function EventRrppTab({ storeId }: Props) {
  const { id: eventId } = useParams() as { id: string };

  const {
    getRRPPsByEventId,
    getRRPPsByStoreId,
    upsertRRPPEevents,
    loading,
  } = useRRPP();

  const [assigned, setAssigned] = useState<RRPP[]>([]);
  const [available, setAvailable] = useState<RRPP[]>([]);
  const [selectedRrppId, setSelectedRrppId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedRrpp = useMemo(
    () => available.find(r => r.id === selectedRrppId) || null,
    [available, selectedRrppId]
  );

  const fetchData = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    try {
      const assignedList = await getRRPPsByEventId(eventId, {
        includeDeleted: false,
        onlyEnabled: true,
        onlyMatchedEvent: true,
      });

      setAssigned(assignedList);

      if (storeId) {
        const byStore = await getRRPPsByStoreId(storeId, {
          includeDeleted: false,
          onlyEnabled: true,
          onlyMatchedStore: false,
        });

        const assignedIds = new Set(assignedList.map(r => r.id));
        setAvailable(byStore.filter(r => !assignedIds.has(r.id)));
      } else {
        setAvailable([]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [eventId, storeId, getRRPPsByEventId, getRRPPsByStoreId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    if (!selectedRrppId) {
      toast.info('Seleccioná un RRPP para agregar.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCopyLink = (rrpp: RRPP) => {
    const link = rrpp.events?.[0]?.link;
    if (!link) {
      toast.info('Este RRPP aún no tiene link asignado para este evento.');
      return;
    }
    const urlOrigin = window.location.origin;
    const url = new URL(link, urlOrigin).toString();
    navigator.clipboard.writeText(url);
    toast.success('Link de venta copiado al portapapeles');
  };

  const handleSaveRrpp = async ({
    ticketPercentage,
    comboPercentage,
    discountPercentage,
  }: { ticketPercentage: number; comboPercentage: number; discountPercentage: number }) => {
    if (!selectedRrpp) return;

    const commision = {
      ticketPercent: ticketPercentage,
      combosPercent: comboPercentage,
      discount: discountPercentage,
    };

    const updated = await upsertRRPPEevents(selectedRrpp.userId, [
      { eventId, enabled: true, commisions: commision },
    ]);

    if (updated) {
      const fullName = `${selectedRrpp.name ?? ''} ${selectedRrpp.lastName ?? ''}`.trim();
      toast.success(`${fullName || selectedRrpp.email || selectedRrpp.userId} agregado al evento.`);
      setIsModalOpen(false);
      setSelectedRrppId('');
      fetchData();
    }
  };

  const isBusy = loading || refreshing;

  return (
    <>
      <div className="mt-6 space-y-6">
        <Card className='border-none bg-secondary/20'>
          <CardHeader className="flex flex-col md:flex-row md:items-center space-y-3 justify-between">
            <div className='space-y-2'>
              <CardTitle>RRPP del Evento</CardTitle>
              <CardDescription>Asigna RRPP y gestioná comisiones y link de venta.</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedRrppId}
                onValueChange={setSelectedRrppId}
                disabled={!storeId || isBusy || available.length === 0}
              >
                <SelectTrigger className="w-[260px] border-none bg-secondary/40">
                  <SelectValue placeholder={storeId ? "Seleccionar RRPP para agregar" : "Seleccioná un club del evento"} />
                </SelectTrigger>
                <SelectContent className='border-none'>
                  {available.map(rrpp => {
                    const fullName = `${rrpp.name ?? ''} ${rrpp.lastName ?? ''}`.trim() || rrpp.email || rrpp.userId;
                    return <SelectItem key={rrpp.id} value={rrpp.id}>{fullName}</SelectItem>;
                  })}
                </SelectContent>
              </Select>

              <Button onClick={handleOpenModal} disabled={!selectedRrppId || isBusy}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar RRPP
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isBusy && assigned.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : assigned.length > 0 ? (
              <>
                <div className="flex flex-col gap-4 md:hidden">
                  {assigned.map((rrpp) => {
                    const fullName = `${rrpp.name ?? ''} ${rrpp.lastName ?? ''}`.trim() || rrpp.email || rrpp.userId;
                    const evt = rrpp.events?.[0];
                    const comm = Array.isArray(evt?.commisions) ? evt?.commisions[0] : evt?.commisions;
                    const ticketsPct = comm?.ticketPercent ?? 0;
                    const combosPct = comm?.combosPercent ?? 0;
                    const discountPct = comm?.discount ?? 0;
                    const email = rrpp.email || 'N/A';
                    return (
                      <Card
                        key={rrpp.id}
                        className="border-none bg-secondary/40"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="font-semibold">
                                {rrpp.name || "Sin nombre"}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className='border-none' align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem >
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" disabled={!evt?.link} onClick={() => handleCopyLink(rrpp)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copiar Link
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="text-sm space-y-3">
                            <div className="flex justify-between">
                              <span>Nombre y Apellido</span>
                              <span>{fullName}</span>
                            </div>

                            <div className="flex justify-between">
                              <span>Email</span>
                              <span>{email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Porcentaje Tickets</span>
                              <span>{ticketsPct}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Porcentaje Combos</span>
                              <span>{combosPct}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Descuento</span>
                              <span>{discountPct}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                <div className="hidden md:block rounded-md">
                  <Table >
                    <TableHeader>
                      <TableRow className='border-b border-secondary  '>
                        <TableHead>Nombre y Apellido</TableHead>
                        <TableHead className="text-center">Email</TableHead>
                        <TableHead className="text-center">Porcentaje Tickets</TableHead>
                        <TableHead className="text-center">Porcentaje Combos</TableHead>
                        <TableHead className="text-center">Descuento</TableHead>
                        <TableHead className="text-right">Link de Venta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody >
                      {assigned.map((rrpp) => {
                        const fullName = `${rrpp.name ?? ''} ${rrpp.lastName ?? ''}`.trim() || rrpp.email || rrpp.userId;
                        const evt = rrpp.events?.[0];
                        const comm = Array.isArray(evt?.commisions) ? evt?.commisions[0] : evt?.commisions;
                        const ticketsPct = comm?.ticketPercent ?? 0;
                        const combosPct = comm?.combosPercent ?? 0;
                        const discountPct = comm?.discount ?? 0;
                        const email = rrpp.email || 'N/A';

                        return (
                          <TableRow key={rrpp.id} className='border-none'>
                            <TableCell className="font-medium">{fullName}</TableCell>
                            <TableCell className="text-center">{email}</TableCell>
                            <TableCell className="text-center">{ticketsPct}%</TableCell>
                            <TableCell className="text-center">{combosPct}%</TableCell>
                            <TableCell className="text-center">{discountPct}%</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='border-none' align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem >
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" disabled={!evt?.link} onClick={() => handleCopyLink(rrpp)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copiar Link
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No hay RRPP asignados a este evento.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Podés completar luego con tus métricas reales */}
        {/* <Card> ... ventas por RRPP ... </Card> */}
      </div>

      <RrppFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRrpp}
        rrppData={selectedRrpp ? { id: selectedRrpp.id, name: `${selectedRrpp.name ?? ''} ${selectedRrpp.lastName ?? ''}`.trim() } : null}
      />
    </>
  );
}
