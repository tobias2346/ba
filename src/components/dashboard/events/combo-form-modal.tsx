'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Ticket, User, X, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface ComboFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  eventData?: any;
  tickets: any[];
  loading: boolean;
}

export function ComboFormModal({ isOpen, onClose, onSave, initialData, eventData, tickets, loading }: ComboFormModalProps) {
  const [currentDescription, setCurrentDescription] = useState('');
  const isEditing = !!initialData;
  
  const initialTab = useMemo(() => {
    if (!isEditing) return 'combo-x';
    return initialData.type === 'comboM' || (Array.isArray(initialData.includes) && initialData.includes.length > 1)
      ? 'combo-multi'
      : 'combo-x';
  }, [isEditing, initialData]);

  const [currentTab, setCurrentTab] = useState(initialTab);
  const hasBeenSold = isEditing && initialData?.stock?.sold > 0;

  const isSectorized = eventData?.type === 'sectorized' && eventData?.stadium?.sectors?.length > 0;

  // --------- SCHEMAS ----------
  const comboXSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido.'),
    descriptions: z.array(z.string()).min(1, 'Debes agregar al menos una descripción.'),
    ticketId: z.string().min(1, 'Debes seleccionar un ticket.'),
    ticketQuantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1.'),
    price: z.coerce.number().min(0, 'El precio debe ser positivo.'),
    maxPerPerson: z.coerce.number().min(1, 'Mínimo 1 por persona.'),
    stock: z.coerce.number().min(1, 'Debe haber al menos 1 combo disponible.'),
  }).refine(data => {
      const selectedTicket = tickets.find(t => t.id === data.ticketId);
      if (!selectedTicket) return true; // No se puede validar sin el ticket
      return data.maxPerPerson * data.ticketQuantity <= selectedTicket.maxPerPerson;
  }, {
      message: "La cantidad de combos por persona, multiplicada por los tickets en el combo, excede el límite del ticket individual.",
      path: ['maxPerPerson'],
  });

  const comboMultiSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido.'),
    descriptions: z.array(z.string()).min(1, 'Debes agregar al menos una descripción.'),
    includes: z.array(z.object({
      ticketTypeId: z.string(),
      quantity: z.coerce.number().min(1, "Mínimo 1").max(10, 'Máximo 10 tickets por tipo'),
    })).min(2, 'Debes seleccionar al menos dos tipos de tickets.').max(4, 'Puedes seleccionar hasta 4 tipos de tickets.'),
    price: z.coerce.number().min(0, 'El precio debe ser positivo.'),
    maxPerPerson: z.coerce.number().min(1, 'Mínimo 1 por persona.'),
    stock: z.coerce.number().min(1, 'Debe haber al menos 1 combo disponible.'),
  }).refine(data => {
      for (const item of data.includes) {
        const selectedTicket = tickets.find(t => t.id === item.ticketTypeId);
        if (selectedTicket && (data.maxPerPerson * item.quantity > selectedTicket.maxPerPerson)) {
          return false;
        }
      }
      return true;
  }, {
      message: "La combinación de combos por persona y cantidad de tickets excede el límite para al menos un tipo de ticket.",
      path: ['maxPerPerson'],
  });


  const formX = useForm<z.infer<typeof comboXSchema>>({
    resolver: zodResolver(comboXSchema),
    defaultValues: { name: '', descriptions: [], ticketId: '', ticketQuantity: 1, price: 0, maxPerPerson: 1, stock: 1 },
  });
  
  const formMulti = useForm<z.infer<typeof comboMultiSchema>>({
    resolver: zodResolver(comboMultiSchema),
    defaultValues: { name: '', descriptions: [], includes: [], price: 0, maxPerPerson: 1, stock: 1 },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: formMulti.control,
    name: "includes"
  });

  const descriptionsX = formX.watch('descriptions');
  const descriptionsMulti = formMulti.watch('descriptions');

  const selectedTicketIdX = formX.watch('ticketId');
  const selectedTicketForComboX = useMemo(() => {
    return tickets.find(t => t.id === selectedTicketIdX);
  }, [selectedTicketIdX, tickets]);

  const ticketsHaveDifferentSectors = useMemo(() => {
    if (!isSectorized || !tickets || tickets.length < 2) return false;
    const uniqueSectorIds = new Set(tickets.map(t => t.sectorId).filter(Boolean));
    return uniqueSectorIds.size > 1;
  }, [tickets, isSectorized]);

  useEffect(() => {
    if (!isOpen) return;

    const tab = !isEditing
      ? 'combo-x'
      : initialData.type === 'comboM' || (Array.isArray(initialData.includes) && initialData.includes.length > 1)
        ? 'combo-multi'
        : 'combo-x';
    setCurrentTab(tab);

    if (isEditing) {
      if (tab === 'combo-x') {
        formX.reset({
          name: initialData.name || '',
          descriptions: initialData.description || [],
          price: initialData.price || 0,
          stock: initialData.stock?.aviable || 1,
          maxPerPerson: initialData.maxPerPerson || 1,
          ticketId: initialData.includes?.[0]?.catalogItemId || initialData.includes?.[0]?.ticketTypeId || '',
          ticketQuantity:  initialData?.includes[0].quantity || 1,
        });
      } else { // combo-multi
        const inc = (initialData.includes || []).map((inc: any) => ({
          ticketTypeId: inc.catalogItemId || inc.ticketTypeId,
          quantity: inc.quantity,
        }));
        formMulti.reset({
          name: initialData.name || '',
          descriptions: initialData.description || [],
          price: initialData.price || 0,
          stock: initialData.stock?.aviable || 1,
          maxPerPerson: initialData.maxPerPerson || 1,
          includes: inc,
        });
        replace(inc);
      }
    } else { // creating
      formX.reset({ name: '', descriptions: [], ticketId: '', ticketQuantity: 1, price: 0, maxPerPerson: 1, stock: 1 });
      formMulti.reset({ name: '', descriptions: [], includes: [], price: 0, maxPerPerson: 1, stock: 1 });
      replace([]);
    }

    setCurrentDescription('');
  }, [isOpen, isEditing, initialData, formX, formMulti, replace]);
  
  const onXSubmit = (data: z.infer<typeof comboXSchema>) => {
    const selectedTicket = tickets.find(t => t.id === data.ticketId);
    const payload = {
      type: 'comboX',
      name: data.name,
      description: data.descriptions,
      price: data.price,
      stock: data.stock,
      maxPerPerson: data.maxPerPerson,
      persons: data.ticketQuantity,
      includes: [{ ticketTypeId: data.ticketId, quantity: data.ticketQuantity }],
      soldOut: false,
      visible: true,
      sectorId: selectedTicket?.sectorId || ""
    };
    onSave(payload);
  };

  const onMultiSubmit = (data: z.infer<typeof comboMultiSchema>) => {
    const selectedSectorIds = data.includes.map(inc => tickets.find(t => t.id === inc.ticketTypeId)?.sectorId).filter(Boolean);
    const uniqueSelected = new Set(selectedSectorIds);
    if (isSectorized && uniqueSelected.size < data.includes.length) {
      formMulti.setError('includes', { message: 'Todos los tickets seleccionados deben pertenecer a sectores diferentes.' });
      return;
    }
    
    const payload = {
      type: 'comboM',
      name: data.name,
      description: data.descriptions,
      price: data.price,
      stock: data.stock,
      maxPerPerson: data.maxPerPerson,
      persons: 1,
      includes: data.includes,
      soldOut: false,
      visible: true,
      sectorId: ""
    };
    onSave(payload);
  };

  const addDescription = () => {
    if (currentDescription.trim() && (currentTab === 'combo-x' ? descriptionsX : descriptionsMulti).length < 5) {
      const form = currentTab === 'combo-x' ? formX : formMulti;
      const current = form.getValues('descriptions');
      form.setValue('descriptions', [...current, currentDescription.trim()]);
      setCurrentDescription('');
    }
  };
  
  const removeDescription = (index: number) => {
    if (hasBeenSold) return;
    const form = currentTab === 'combo-x' ? formX : formMulti;
    const current = form.getValues('descriptions');
    const next = [...current];
    next.splice(index, 1);
    form.setValue('descriptions', next);
  };
  
  const handleMultiTicketCheck = (checked: boolean, ticketId: string) => {
    if (isEditing) return;
    const currentIndex = fields.findIndex(field => field.ticketTypeId === ticketId);
    if (checked) {
      if (fields.length < 4) {
        append({ ticketTypeId: ticketId, quantity: 1 });
      }
    } else {
      if (currentIndex !== -1) {
        remove(currentIndex);
      }
    }
  };

  const renderFooter = (formId: string) => (
    <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-0 -mx-6 px-6">
      <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
      <Button type="submit" form={formId} disabled={loading}>
        {loading && <Spinner size="sm" className="mr-2"/>}
        {isEditing ? 'Guardar Cambios' : 'Crear Combo'}
      </Button>
    </DialogFooter>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Combo</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los detalles del combo.' : 'Elige el tipo de combo y completa los detalles.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={initialTab} value={currentTab} onValueChange={setCurrentTab} className="flex-grow flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="combo-x" disabled={isEditing}>Combo X</TabsTrigger>
            <TabsTrigger value="combo-multi" disabled={isEditing}>Combo Multi</TabsTrigger>
          </TabsList>
          
          <div className="flex-grow overflow-y-auto pr-6 pl-1 mt-4">
            {/* COMBO X */}
            <TabsContent value="combo-x" className="mt-0">
              {tickets.length === 0 ? (
                <Alert variant="destructive">
                  <Ticket className="h-4 w-4"/>
                  <AlertTitle>No hay tickets</AlertTitle>
                  <AlertDescription>Debes crear al menos un tipo de ticket para poder armar un combo.</AlertDescription>
                </Alert>
              ) : (
                <Form {...formX}>
                  <form id="form-x" onSubmit={formX.handleSubmit(onXSubmit)} className="space-y-4">
                    <FormField control={formX.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Combo*</FormLabel>
                        <FormControl><Input {...field} placeholder="Ej: Combo Amigos" disabled={hasBeenSold}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <div className="space-y-2">
                      <FormLabel>Descripción*</FormLabel>
                      <div className="flex gap-2">
                        <Input value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} maxLength={50} placeholder="Añade una característica o beneficio" disabled={hasBeenSold}/>
                        <Button type="button" variant="secondary" onClick={addDescription} disabled={!currentDescription.trim() || descriptionsX.length >= 5 || hasBeenSold}>Agregar</Button>
                      </div>
                      {formX.formState.errors.descriptions && <p className="text-sm font-medium text-destructive">{formX.formState.errors.descriptions.message}</p>}
                      {descriptionsX.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {descriptionsX.map((desc, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>{desc}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDescription(index)} disabled={hasBeenSold}><X className="h-4 w-4" /></Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator/>

                    <div className='flex gap-4 items-end'>
                      <FormField control={formX.control} name="ticketId" render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormLabel>Tipo de Ticket*</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Seleccionar ticket" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tickets.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}{t.sector?.name ? ` (${t.sector.name})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <span className="pb-2 text-lg">X</span>
                      <FormField control={formX.control} name="ticketQuantity" render={({ field }) => (
                        <FormItem>
                          <FormControl><Input type="number" {...field} min={1} max={selectedTicketForComboX?.maxPerPerson || 10} className="w-20" disabled={isEditing}/></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <Separator/>

                    <FormField control={formX.control} name="price" render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'><DollarSign className="h-5 w-5 text-muted-foreground"/><FormLabel>Valor del combo</FormLabel></div>
                          <div className="w-32"><FormControl><Input type="number" {...field} disabled={hasBeenSold}/></FormControl></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Separator/>

                    <FormField control={formX.control} name="maxPerPerson" render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'><User className="h-5 w-5 text-muted-foreground"/><FormLabel>Combos por persona</FormLabel></div>
                          <div className="w-32"><FormControl><Input type="number" {...field} min={1} /></FormControl></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Separator/>

                    <FormField control={formX.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'><Ticket className="h-5 w-5 text-muted-foreground"/><FormLabel>Combos por evento</FormLabel></div>
                          <div className="w-32"><FormControl><Input type="number" {...field} min={1} /></FormControl></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {renderFooter("form-x")}
                  </form>
                </Form>
              )}
            </TabsContent>

            {/* COMBO MULTI */}
            <TabsContent value="combo-multi" className="mt-0">
              {!isSectorized || !ticketsHaveDifferentSectors ? (
                <Alert variant="destructive">
                  <Ticket className="h-4 w-4"/>
                  <AlertTitle>No es posible crear un Combo Multi</AlertTitle>
                  <AlertDescription>
                    Los Combos Multi solo están disponibles para eventos con estadios sectorizados y con al menos dos tipos de tickets en sectores diferentes.
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...formMulti}>
                  <form id="form-multi" onSubmit={formMulti.handleSubmit(onMultiSubmit)} className="space-y-4">
                    <FormField control={formMulti.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Combo*</FormLabel>
                        <FormControl><Input {...field} placeholder="Ej: Experiencia Completa" disabled={hasBeenSold}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="space-y-2">
                      <FormLabel>Descripción*</FormLabel>
                      <div className="flex gap-2">
                        <Input value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} maxLength={50} placeholder="Añade una característica" disabled={hasBeenSold}/>
                        <Button type="button" variant="secondary" onClick={addDescription} disabled={!currentDescription.trim() || descriptionsMulti.length >= 5 || hasBeenSold}>Agregar</Button>
                      </div>
                      {formMulti.formState.errors.descriptions && <p className="text-sm font-medium text-destructive">{formMulti.formState.errors.descriptions.message}</p>}
                      {descriptionsMulti.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {descriptionsMulti.map((desc, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>{desc}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDescription(index)} disabled={hasBeenSold}><X className="h-4 w-4" /></Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator/>
                    
                    <div className="space-y-2">
                      <FormLabel>Tickets Incluidos*</FormLabel>
                      {tickets.map(ticket => {
                        const checked = fields.some(field => field.ticketTypeId === ticket.id);
                        const index = fields.findIndex(field => field.ticketTypeId === ticket.id);
                        return (
                          <div key={ticket.id} className="flex items-center space-x-3 space-y-0 p-2 rounded-md border">
                            <Checkbox
                              id={`ticket-${ticket.id}`}
                              checked={checked}
                              onCheckedChange={(ch) => handleMultiTicketCheck(Boolean(ch), ticket.id)}
                              disabled={isEditing || (fields.length >= 4 && !checked)}
                            />
                            <label htmlFor={`ticket-${ticket.id}`} className="font-normal flex-grow">
                              {ticket.name} <span className="text-muted-foreground">({ticket.sector?.name || 'General'})</span>
                            </label>
                            {checked && index > -1 && (
                              <Controller
                                control={formMulti.control}
                                name={`includes.${index}.quantity`}
                                render={({ field }) => (
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">x</span>
                                    <Input type="number" {...field} className="w-16 h-8" disabled={isEditing} min={1} max={10}/>
                                  </div>
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                      <FormMessage>
                        {formMulti.formState.errors.includes?.root?.message || (formMulti.formState.errors as any).includes?.message}
                      </FormMessage>
                    </div>
                    
                    <Separator/>

                    <FormField control={formMulti.control} name="price" render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'><DollarSign className="h-5 w-5 text-muted-foreground"/><FormLabel>Valor del combo</FormLabel></div>
                          <div className="w-32"><FormControl><Input type="number" {...field} disabled={hasBeenSold} /></FormControl></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Separator/>

                    <FormField control={formMulti.control} name="maxPerPerson" render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'><User className="h-5 w-5 text-muted-foreground"/><FormLabel>Combos por persona</FormLabel></div>
                          <div className="w-32"><FormControl><Input type="number" {...field} min={1} /></FormControl></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Separator/>

                    <FormField control={formMulti.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'><Ticket className="h-5 w-5 text-muted-foreground"/><FormLabel>Combos por evento</FormLabel></div>
                          <div className="w-32"><FormControl><Input type="number" {...field} min={1} /></FormControl></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {renderFooter("form-multi")}
                  </form>
                </Form>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
