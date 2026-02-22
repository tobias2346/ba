'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { Percent, User } from 'lucide-react';

const rrppSchema = z.object({
  ticketPercentage: z.coerce.number().min(0, 'Debe ser >= 0').max(100, 'Debe ser <= 100'),
  comboPercentage:  z.coerce.number().min(0, 'Debe ser >= 0').max(100, 'Debe ser <= 100'),
  discountPercentage: z.coerce.number().min(0, 'Debe ser >= 0').max(100, 'Debe ser <= 100').default(0),
});

export type RrppFormData = z.infer<typeof rrppSchema>;

interface RrppFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RrppFormData) => void;
  rrppData?: { id: string; name: string } | null;
}

export function RrppFormModal({ isOpen, onClose, onSave, rrppData }: RrppFormModalProps) {
  const form = useForm<RrppFormData>({
    resolver: zodResolver(rrppSchema),
    defaultValues: {
      ticketPercentage: 0,
      comboPercentage: 0,
      discountPercentage: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        ticketPercentage: 0,
        comboPercentage: 0,
        discountPercentage: 0,
      });
    }
  }, [isOpen, form]);

  const onSubmit = (data: RrppFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Comisiones a RRPP</DialogTitle>
          <DialogDescription>
            Definí los porcentajes de comisión para tickets, combos y el descuento para este RRPP.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{rrppData?.name || 'RRPP no seleccionado'}</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ticketPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje Tickets</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" min={0} max={100} step={1} {...field} />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comboPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje Combos</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" min={0} max={100} step={1} {...field} />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descuento (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" min={0} max={100} step={1} {...field} />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Agregar RRPP</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
