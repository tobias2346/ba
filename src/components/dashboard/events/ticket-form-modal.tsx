'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, useMemo } from 'react';
import { DollarSign, CheckCircle, Ticket, User, X, Gift, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import * as z from 'zod';

const ticketSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.').max(20, 'Máximo 20 caracteres.'),
  descriptions: z.array(z.string()).min(1, 'Debes agregar al menos una descripción.'),
  isFree: z.boolean().default(false).optional(),
  price: z.coerce.number().min(0, 'El precio debe ser un número positivo.'),
  quantityPerBuy: z.coerce.number().min(1, 'Mínimo 1').max(10, 'Máximo 10'),
  quantity: z.coerce.number().min(1, 'Debe haber al menos 1 ticket disponible.'),
  sectorId: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  currency?: string;
  eventData?: any;
  loading: boolean;
  /** FIX: derivación explícita para evitar timing issues */
  sectorized?: boolean;
  sectors?: Array<{ id: string; name: string }>;
}

export function TicketFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  currency = '$',
  eventData,
  loading,
  sectorized,
  sectors: sectorsProp = [],
}: TicketFormModalProps) {
  const [currentDescription, setCurrentDescription] = useState('');
  const isEditing = !!initialData;
  const hasBeenSold = isEditing && initialData?.stock?.sold > 0;

  // === Sectorización robusta ===
  const isSectorized = useMemo(() => {
    if (typeof sectorized === 'boolean') return sectorized;
    const byType = (eventData?.type || '').toLowerCase() === 'sectorized';
    const byStadium = Array.isArray(eventData?.stadium?.sectors) && eventData.stadium.sectors.length > 0;
    return Boolean(byType || byStadium);
  }, [sectorized, eventData]);

  // Lista de sectores (prop > eventData > [])
  const sectors = useMemo(() => {
    if (Array.isArray(sectorsProp) && sectorsProp.length) return sectorsProp;
    return Array.isArray(eventData?.stadium?.sectors) ? eventData.stadium.sectors : [];
  }, [sectorsProp, eventData]);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: '',
      descriptions: [],
      isFree: false,
      price: 0,
      quantityPerBuy: 1,
      quantity: 1,
      sectorId: '',
    },
    mode: 'onSubmit',
  });

  const { watch, setValue, reset, formState, setError, getValues } = form;
  const descriptions = watch('descriptions');
  const sectorIdValue = watch('sectorId');
  const isFree = watch('isFree');

  const handleIsFreeChange = (val: boolean | 'indeterminate') => {
    const checked = !!val;
    setValue('isFree', checked, { shouldDirty: true, shouldValidate: true });
    if (checked) {
      setValue('price', 0, { shouldDirty: true, shouldValidate: true });
    }
  };

  // Reset controlado: depende de isOpen, initialData y eventData (para cuando llega tarde)
  useEffect(() => {
    if (isOpen) {
      if(isEditing) {
        reset({
          name: initialData.name,
          descriptions: initialData.description,
          isFree: initialData.isFree,
          price: initialData.price,
          quantityPerBuy: initialData.maxPerPerson,
          quantity: initialData.stock.aviable,
          sectorId: initialData.sectorId
        });
      } else {
        reset({
          name: '',
          descriptions: [],
          isFree: false,
          price: 0,
          quantityPerBuy: 1,
          quantity: 1,
          sectorId: '',
        });
      }
    }
  }, [isOpen, initialData, isEditing, reset, eventData]);

  const addDescription = () => {
    if (currentDescription.trim() && descriptions.length < 5) {
      setValue('descriptions', [...descriptions, currentDescription.trim()]);
      setCurrentDescription('');
    }
  };
  
  const removeDescription = (index: number) => {
    if (hasBeenSold) return;
    const newDescriptions = [...descriptions];
    newDescriptions.splice(index, 1);
    setValue('descriptions', newDescriptions);
  };

  const onSubmit = (data: TicketFormData) => {
    // Validaciones extra: sectorizado sin sectores o sin selección
    if (isSectorized && sectors.length === 0) {
      setError('sectorId', { message: 'Los sectores aún no están disponibles. Intentá nuevamente en unos segundos.' });
      return;
    }
    if (isSectorized && !data.sectorId) {
      setError('sectorId', { message: 'Debes seleccionar un sector.' });
      return;
    }

    const payload = {
      type: 'ticket',
      name: data.name,
      description: data.descriptions,
      isFree: data.isFree,
      price: data.price,
      stock: data.quantity,            // el backend normaliza a objeto
      maxPerPerson: data.quantityPerBuy,
      sectorId: data.sectorId || '',
      soldOut: false,
      visible: true,
    };
    onSave(payload);
  };

  const submitDisabled =
    loading ||
    (isSectorized && (sectors.length === 0 || !sectorIdValue));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Ticket</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los detalles del ticket.' : 'Define los detalles y características del nuevo tipo de ticket.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 pl-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del ticket*</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={20} disabled={hasBeenSold} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator/>

              <div className="space-y-2">
                <FormLabel>Descripción*</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    value={currentDescription}
                    onChange={(e) => setCurrentDescription(e.target.value)}
                    maxLength={50}
                    placeholder="Añade una característica o beneficio"
                    disabled={hasBeenSold}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addDescription}
                    disabled={!currentDescription.trim() || descriptions.length >= 5 || hasBeenSold}
                  >
                    Agregar
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Mínimo 1, máximo 5 descripciones.</span>
                  <span>{currentDescription.length}/50</span>
                </div>
                {formState.errors.descriptions && (
                  <p className="text-sm font-medium text-destructive">
                    {formState.errors.descriptions.message as string}
                  </p>
                )}

                {descriptions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {descriptions.map((desc, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary"/>
                          {desc}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeDescription(index)}
                          disabled={hasBeenSold}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator/>

              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                      <Gift className="h-5 w-5 text-muted-foreground"/>
                      <FormLabel>Es gratuito</FormLabel>
                    </div>
                    <div className="w-32 flex justify-center">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(val) => {
                            field.onChange(!!val);
                            handleIsFreeChange(val);
                          }}
                          disabled={hasBeenSold}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                      <DollarSign className="h-5 w-5 text-muted-foreground"/>
                      <FormLabel>Valor del ticket</FormLabel>
                    </div>
                    <div className="w-32">
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="0.00"
                          disabled={hasBeenSold || isFree}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Separator/>
              
              <FormField
                control={form.control}
                name="quantityPerBuy"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                      <User className="h-5 w-5 text-muted-foreground"/>
                      <FormLabel>Tickets por persona</FormLabel>
                    </div>
                    <div className="w-32">
                      <FormControl>
                        <Input type="number" {...field} min={1} max={10} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <Separator/>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                      <Ticket className="h-5 w-5 text-muted-foreground"/>
                      <FormLabel>Tickets por evento</FormLabel>
                    </div>
                    <div className="w-32">
                      <FormControl>
                        <Input type="number" {...field} min={1}/>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {isSectorized && (
                <>
                  <Separator/>
                  {sectors.length === 0 ? (
                    <div className="flex items-start gap-2 text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>Los sectores aún están cargándose. Cerrá este diálogo y volvé a abrirlo en unos segundos.</span>
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="sectorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sector*</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={hasBeenSold}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar un sector" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sectors.map((sector: any) => (
                                <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-0 -mx-6 px-6">
                <div className="w-full flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                  <Button type="submit" disabled={submitDisabled}>
                    {loading && <Spinner size="sm" className="mr-2"/>}
                    {isEditing ? 'Guardar Cambios' : 'Crear Ticket'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
