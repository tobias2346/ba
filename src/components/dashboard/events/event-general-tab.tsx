'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info, Ticket, Users, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TicketFormModal } from './ticket-form-modal';
import { useEvents } from '@/contexts/events-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ComboFormModal } from './combo-form-modal';
import { toast } from 'sonner';
import { SectorFormModal } from './sector-form-modal';
import modalFeedbackReact from '@/components/shared/feedback-modal';

interface EventGeneralTabProps {
  eventData?: any;
  onUpdate: (data: any) => void;
  onRefresh: () => void;
}

export function EventGeneralTab({ eventData, onUpdate, onRefresh }: EventGeneralTabProps) {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const { addCatalogItem, updateCatalogItem, deleteCatalogItem, updateCatalogItemVisibility, loading, updateCatalogItemSoldOut, updateCatalogItemNumerated } = useEvents();
  // === Derivación robusta del modo sectorizado ===
  const isSectorizedEvent = useMemo(() => {
    const byType = (eventData?.type || '').toLowerCase() === 'sectorized';
    const byStadium = Array.isArray(eventData?.stadium?.sectors) && eventData.stadium.sectors.length > 0;
    return Boolean(byType || byStadium);
  }, [eventData]);

  const sectors = useMemo(() => {
    return Array.isArray(eventData?.stadium?.sectors) ? eventData!.stadium.sectors : [];
  }, [eventData]);

  const tickets = useMemo(() => {
    return eventData?.catalogItems?.filter((item: any) => item.type === 'ticket') || [];
  }, [eventData]);

  const ticketsForCombos = eventData?.catalogItems?.filter((item: any) => item.type === 'ticket' && !item.isFree) || [];

  const combos = useMemo(() => {
    return eventData?.catalogItems?.filter((item: any) => item.type.startsWith('combo')) || [];
  }, [eventData]);

  const seats = useMemo(() => {
    return eventData?.catalogItems?.filter((item: any) => item.type === 'seats') || [];
  }, [eventData]);

  console.log(eventData, tickets, combos, seats)

  const totalAmountTicketsSold = useMemo(() => {
    return tickets.reduce((acc: number, ticket: any) => acc + (ticket.price * ticket.stock.sold), 0);
  }, [tickets]);

  const totalQuantityTicketsSold = useMemo(() => {
    return tickets.reduce((acc: number, ticket: any) => acc + ticket.stock.sold, 0);
  }, [tickets]);

  const totalAmountCombosSold = useMemo(() => {
    return combos.reduce((acc: number, combo: any) => acc + (combo.price * combo.stock.sold), 0);
  }, [combos]);

  const totalQuantityCombosSold = useMemo(() => {
    return combos.reduce((acc: number, combo: any) => acc + combo.stock.sold, 0);
  }, [combos]);

  const totalAmountSeatsSold = useMemo(() => {
    return seats.reduce((acc: number, combo: any) => acc + (combo.price * combo.stock.sold), 0);
  }, [seats]);

  const totalQuantitySeatsSold = useMemo(() => {
    return seats.reduce((acc: number, combo: any) => acc + combo.stock.sold, 0);
  }, [seats]);

  const allTransacted = totalAmountTicketsSold + totalAmountCombosSold;

  const handleSwitchChange = (field: 'soldOut' | 'onBillboard', value: boolean) => {
    onUpdate({ [field]: value });
  };

  const handleSaveItem = async (itemData: any) => {
    let success;
    if (editingItem) {
      success = await updateCatalogItem(eventData.id, editingItem.id, itemData);
    } else {
      success = await addCatalogItem(eventData.id, itemData);
    }
    if (success) {
      onRefresh();
      setIsTicketModalOpen(false);
      setIsComboModalOpen(false);
      setIsSectorModalOpen(false)
      setEditingItem(null);
    }
  };

  const handleOpenModal = (item: any = null, type: 'ticket' | 'combo') => {
    // Guardas para primera carga: si es sectorizado pero todavía no llegaron sectores, aviso y bloqueo
    if (type === 'ticket' && isSectorizedEvent && sectors.length === 0) {
      toast.info('Cargando sectores del estadio... Intentá nuevamente en unos segundos.');
      return;
    }
    if (type === 'combo' && isSectorizedEvent && sectors.length === 0) {
      toast.info('Cargando sectores del estadio... Intentá nuevamente en unos segundos.');
      return;
    }

    setEditingItem(item);
    if (type === 'ticket') {
      setIsTicketModalOpen(true);
    } else {
      setIsComboModalOpen(true);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await deleteCatalogItem(eventData.id, itemId);
    if (success) {
      onRefresh();
    }
  };

  const handleVisibilityChange = async (itemId: string, visible: boolean, price: number = 1) => {
    if (price === 0) {
      modalFeedbackReact(
        "Advertencia",
        "Para habilitar el sector debe seleccionar un precio previamente ",
        "info",
        true
      )
      return
    }
    const success = await updateCatalogItemVisibility(eventData.id, itemId, visible);
    if (success) {
      onRefresh();
    } else {
      toast.error("No se pudo actualizar la visibilidad.");
    }
  };

  const handleSoldOutChange = async (itemId: string, soldOut: boolean) => {
    const success = await updateCatalogItemSoldOut(eventData.id, itemId, soldOut);
    if (success) {
      onRefresh();
    } else {
      toast.error("No se pudo actualizar el estado de agotado.");
    }
  };

  const handleNumeratedChange = async (seat: string, numerated: boolean) => {
    if (seat.stock.reserved > 0 || seat.stock.sold > 0) {
      toast.error("El sector ya tiene entradas compradas o reservadas");
      return
    }
    const success = await updateCatalogItemNumerated(eventData.id, seat.id, numerated);
    if (success) {
      onRefresh();
      toast.success("Estado de numerado actualizado");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: eventData?.store?.paymentCredentials?.currency || 'ARS',
    }).format(amount);
  };

  return (
    <div className="mt-6 space-y-6">
      <Card className='bg-secondary/20 border-none'>
        <CardHeader className="flex flex-col md:flex-row space-y-5 md:items-center justify-between">
          <CardTitle>Configuración de Cartelera</CardTitle>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="sold-out" className="text-sm font-medium">Sold Out</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifica en cartelera la venta total y bloquea la compra.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch
                id="sold-out"
                checked={eventData?.soldOut || false}
                onCheckedChange={(val) => handleSwitchChange('soldOut', val)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="on-billboard" className="text-sm font-medium">En Cartelera</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Activa la visibilidad del evento en las carteleras.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch
                id="on-billboard"
                checked={eventData?.onBillboard || false}
                onCheckedChange={(val) => handleSwitchChange('onBillboard', val)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>
      {
        eventData.type === 'numerated' ?
          <Card className='border-none bg-secondary/20'>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <Ticket className="h-6 w-6" />
                </div>
                <CardTitle>Sectores</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {seats.length > 0 ? (
                <div className="rounded-md border-none">
                  <Table className='border-none'>
                    <TableHeader className='border-none'>
                      <TableRow className='border-none bg-dark/30'>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-center">Precio</TableHead>
                        <TableHead className="text-center">Disponibles</TableHead>
                        <TableHead className="text-center">Reservadas</TableHead>
                        <TableHead className="text-center">Vendidas</TableHead>
                        <TableHead className="text-center">Agotado</TableHead>
                        <TableHead className="text-center">Visible</TableHead>
                        <TableHead className="text-center">Numerado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seats.map((seat: any) => (
                        <TableRow key={seat.id} className='border-none hover:bg-primary/20'>
                          <TableCell className="font-medium">
                            {seat.name}
                            {seat.isFree && (<span className='ml-2 px-2 py-1 bg-[#29abd6] rounded-lg shadow text-xs font-semibold text-gray-950 font-headline'>FREE</span>)}
                          </TableCell>
                          <TableCell className="text-center">{formatCurrency(seat.price)}</TableCell>
                          <TableCell className="text-center">{seat.stock.aviable}</TableCell>
                          <TableCell className="text-center">{seat.stock.reserved}</TableCell>
                          <TableCell className="text-center">{seat.stock.sold}</TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={seat.soldOut}
                              onCheckedChange={(value) => handleSoldOutChange(seat.id, value)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={seat.visible}
                              onCheckedChange={(value) => handleVisibilityChange(seat.id, value, seat.price)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={seat.numerated}
                              onCheckedChange={(value) => handleNumeratedChange(seat, value)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu >
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className='border-none'>
                                <DropdownMenuItem onClick={() => { setEditingItem(seat), setIsSectorModalOpen(true) }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No hay tickets agregados todavía.</p>
                </div>
              )}
            </CardContent>
          </Card>
          :
          <>
            {/* Combos */}
            <Card className='border-none bg-secondary/20'>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle>Combos</CardTitle>
                </div>
                <Button onClick={() => handleOpenModal(null, 'combo')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Combo
                </Button>
              </CardHeader>
              <CardContent>
                {combos.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-4 md:hidden">
                      {combos.map((combo) => (
                        <Card
                          key={combo.id}
                          className="border-none bg-secondary/40"
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="font-semibold">
                                  {combo.name || "Sin nombre"}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='border-none'>
                                  <DropdownMenuItem onClick={() => handleOpenModal(combo, 'combo')}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteItem(combo.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="text-sm space-y-3">
                              <div className="flex justify-between">
                                <span>Precio</span>
                                <span>{formatCurrency(combo.price)}</span>
                              </div>

                              <div className="flex justify-between">
                                <span>Disponibles</span>
                                <span>{combo.stock.aviable}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Reservadas</span>
                                <span>{combo.stock.reserved}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vendidas</span>
                                <span>{combo.stock.sold}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Agotadas</span>
                                <div className="text-center">
                                  <Switch
                                    checked={combo.soldOut}
                                    onCheckedChange={(value) => handleSoldOutChange(combo.id, value)}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Visible</span>
                                <div className="text-center">
                                  <Switch
                                    checked={combo.visible}
                                    onCheckedChange={(value) => handleVisibilityChange(combo.id, value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className=" hidden md:block border-none rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow className='border-none bg-dark/60'>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-center">Precio</TableHead>
                            <TableHead className="text-center">Disponibles</TableHead>
                            <TableHead className="text-center">Reservadas</TableHead>
                            <TableHead className="text-center">Vendidas</TableHead>
                            <TableHead className="text-center">Agotado</TableHead>
                            <TableHead className="text-center">Visible</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {combos.map((combo: any) => (
                            <TableRow key={combo.id} className='border-none hover:bg-primary/20'>
                              <TableCell className="font-medium">{combo.name}</TableCell>
                              <TableCell className="text-center">{formatCurrency(combo.price)}</TableCell>
                              <TableCell className="text-center">{combo.stock.aviable}</TableCell>
                              <TableCell className="text-center">{combo.stock.reserved}</TableCell>
                              <TableCell className="text-center">{combo.stock.sold}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={combo.soldOut}
                                  onCheckedChange={(value) => handleSoldOutChange(combo.id, value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={combo.visible}
                                  onCheckedChange={(value) => handleVisibilityChange(combo.id, value)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className='border-none'>
                                    <DropdownMenuItem onClick={() => handleOpenModal(combo, 'combo')}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteItem(combo.id)} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No hay combos agregados todavía.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tickets */}
            <Card className='border-none bg-secondary/20'>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <CardTitle>Tickets</CardTitle>
                </div>
                <Button onClick={() => handleOpenModal(null, 'ticket')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Ticket
                </Button>
              </CardHeader>
              <CardContent>
                {tickets.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-4 md:hidden">
                      {tickets.map((ticket) => (
                        <Card
                          key={ticket.id}
                          className="border-none bg-secondary/40"
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="font-semibold">
                                  {ticket.name || "Sin nombre"}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='border-none'>
                                  <DropdownMenuItem onClick={() => handleOpenModal(ticket, 'ticket')}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteItem(ticket.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="text-sm space-y-3">
                              <div className="flex justify-between">
                                <span>Precio</span>
                                <span>{formatCurrency(ticket.price)}</span>
                              </div>

                              <div className="flex justify-between">
                                <span>Disponibles</span>
                                <span>{ticket.stock.aviable}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Reservadas</span>
                                <span>{ticket.stock.reserved}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vendidas</span>
                                <span>{ticket.stock.sold}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Agotadas</span>
                                <div className="text-center">
                                  <Switch
                                    checked={ticket.soldOut}
                                    onCheckedChange={(value) => handleSoldOutChange(ticket.id, value)}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Visible</span>
                                <div className="text-center">
                                  <Switch
                                    checked={ticket.visible}
                                    onCheckedChange={(value) => handleVisibilityChange(ticket.id, value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="hidden md:block border-none rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow className='border-none bg-dark/60'>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-center">Precio</TableHead>
                            <TableHead className="text-center">Disponibles</TableHead>
                            <TableHead className="text-center">Reservadas</TableHead>
                            <TableHead className="text-center">Vendidas</TableHead>
                            <TableHead className="text-center">Agotado</TableHead>
                            <TableHead className="text-center">Visible</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tickets.map((ticket: any) => (
                            <TableRow key={ticket.id} className='border-none'>
                              <TableCell className="font-medium">
                                {ticket.name}
                                {ticket.isFree && (<span className='ml-2 px-2 py-1 bg-[#29abd6] rounded-lg shadow text-xs font-semibold text-gray-950 font-headline'>FREE</span>)}
                              </TableCell>
                              <TableCell className="text-center">{formatCurrency(ticket.price)}</TableCell>
                              <TableCell className="text-center">{ticket.stock.aviable}</TableCell>
                              <TableCell className="text-center">{ticket.stock.reserved}</TableCell>
                              <TableCell className="text-center">{ticket.stock.sold}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={ticket.soldOut}
                                  onCheckedChange={(value) => handleSoldOutChange(ticket.id, value)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={ticket.visible}
                                  onCheckedChange={(value) => handleVisibilityChange(ticket.id, value)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className='border-none'>
                                    <DropdownMenuItem onClick={() => handleOpenModal(ticket, 'ticket')}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteItem(ticket.id)} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No hay tickets agregados todavía.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </>
      }

      {/* Totalizadores */}
      <Card className='border-none bg-secondary/20'>
        <CardHeader>
          <CardTitle>Totalizadores</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Tickets Vendidos</p>
            <p className="text-2xl font-bold">{eventData.type === 'numerated' ? totalQuantitySeatsSold : totalQuantityTicketsSold}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Tickets</p>
            <p className="text-2xl font-bold">{formatCurrency(eventData.type === 'numerated' ? totalAmountSeatsSold : totalAmountTicketsSold)}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Combos Vendidos</p>
            <p className="text-2xl font-bold">{totalQuantityCombosSold}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Combos</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmountCombosSold)}</p>
          </div>
          <div className="bg-primary/10 text-primary p-4 rounded-lg">
            <p className="text-sm">Total Transaccionado</p>
            <p className="text-2xl font-bold">{formatCurrency(eventData.type === 'numerated' ? totalAmountSeatsSold : allTransacted)}</p>
          </div>
        </CardContent>
      </Card>

      <TicketFormModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        currency={eventData?.store?.paymentCredentials?.currency || 'ARS'}
        eventData={eventData}
        loading={loading}
        sectorized={isSectorizedEvent}
        sectors={sectors}
      />

      <SectorFormModal
        isOpen={isSectorModalOpen}
        onClose={() => setIsSectorModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        currency={eventData?.store?.paymentCredentials?.currency || 'ARS'}
        eventData={eventData}
        loading={loading}
      />

      {/* 🔧 FIX: pasar initialData y sectorización para que abra correcto en edición y creación */}
      <ComboFormModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        eventData={eventData}
        loading={loading}
        tickets={ticketsForCombos}
      // Si tu ComboFormModal soporta sectorizado, podés pasar también:
      // sectorized={isSectorizedEvent}
      // sectors={sectors}
      />
    </div>
  );
}
