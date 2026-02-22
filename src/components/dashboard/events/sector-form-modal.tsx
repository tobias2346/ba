'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, User, X,} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import * as z from 'zod';

const ticketSchema = z.object({
  descriptions: z.array(z.string()).min(1, 'Debes agregar al menos una descripción.'),
  price: z.coerce.number().min(1, 'El precio debe ser valido.'),
  quantityPerBuy: z.coerce.number().min(1, 'Mínimo 1').max(10, 'Máximo 10'),
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
}

export function SectorFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  eventData,
  loading,
}: TicketFormModalProps) {
  const [currentDescription, setCurrentDescription] = useState('');
  const hasBeenSold = initialData?.stock?.sold > 0;

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      descriptions: [],
      price: 0,
      quantityPerBuy: 1,
    },
    mode: 'onSubmit',
  });

  const { watch, setValue, reset, formState, setError } = form;
  const descriptions = watch('descriptions');


  // Reset controlado: depende de isOpen, initialData y eventData (para cuando llega tarde)
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        descriptions: initialData.description,
        price: initialData.price,
        quantityPerBuy: initialData.maxPerPerson,
      });
    }
  }, [isOpen, initialData, reset, eventData]);

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
    if (data.price === 0) {
      setError('price', { message: 'Precio invalido' });
      return;
    }

    const payload = {
      type: 'seats',
      description: data.descriptions,
      price: data.price,
      maxPerPerson: data.quantityPerBuy,
    };
    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col border-none">
        <DialogHeader>
          <DialogTitle>Editar sector</DialogTitle>
          <DialogDescription>
            Modifica los detalles del sector.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 pl-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <h1 className='font-semibold font-headline text-xl'>
                {initialData?.name}
              </h1>

              <Separator />

              <div className="space-y-2">
                <FormLabel>Descripción*</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={currentDescription}
                    onChange={(e) => setCurrentDescription(e.target.value)}
                    maxLength={50}
                    placeholder="Añade una característica o beneficio"
                    disabled={hasBeenSold}
                    className='border-none'
                  />
                  <Button
                    type="button"
                    className='border-none'
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
                          <CheckCircle className="h-4 w-4 text-primary" />
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
         
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <FormLabel>Valor del ticket</FormLabel>
                    </div>
                    <div className="w-32">
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="0.00"
                          disabled={hasBeenSold}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="quantityPerBuy"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className='flex items-center gap-2'>
                      <User className="h-5 w-5 text-muted-foreground" />
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
              <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-0 -mx-6 px-6">
                <div className="w-full flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Spinner size="sm" className="mr-2" />}
                    Guardar Cambios
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
