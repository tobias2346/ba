'use client';

import { useEffect, useMemo } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { useCarousels } from '@/contexts/carousels-context';
import { Spinner } from '@/components/ui/spinner';

interface CarouselFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function CarouselFormModal({ isOpen, onClose, initialData }: CarouselFormModalProps) {
  const { carousels, createCarousel, updateCarousel, loading } = useCarousels();

  const isEditing = !!initialData;

  // Reglas: crear => [1 .. length+1] ; editar => [1 .. length]
  const maxActual = useMemo(
    () => (isEditing ? carousels.length : carousels.length + 1),
    [carousels.length, isEditing]
  );

  // Schema con límite dinámico — se recrea cuando cambia maxActual.
  const carouselSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, 'El nombre es requerido.'),
        position: z
          .coerce
          .number()
          .int('Debe ser un número entero.')
          .min(1, 'La posición debe ser al menos 1.')
          .max(maxActual, `La posición no puede ser mayor que ${maxActual}.`),
        active: z.boolean(),
      }),
    [maxActual]
  );

  type CarouselFormData = z.infer<typeof carouselSchema>;

  const form = useForm<CarouselFormData>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      name: initialData?.name || '',
      position: initialData?.position || maxActual,
      active: initialData?.active ?? true,
    },
    mode: 'onChange', // valida mientras se tipea
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name || '',
        position: initialData?.position || maxActual,
        active: initialData?.active ?? true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData, maxActual]);

  const clamp = (val: number) => {
    if (Number.isNaN(val)) return '' as unknown as number; // permite campo vacío momentáneamente
    if (val < 1) return 1;
    if (val > maxActual) return maxActual;
    return val;
  };

  const onSubmit = async (data: CarouselFormData) => {
    let success: boolean;
    if (isEditing) {
      success = await updateCarousel(initialData.id, data);
    } else {
      success = await createCarousel(data);
    }
    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-background border-none'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Carrusel</DialogTitle>
          <DialogDescription>
            Completa la información para {isEditing ? 'actualizar el' : 'crear un nuevo'} carrusel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Carrusel</FormLabel>
                    <FormControl>
                      <Input className='bg-secondary/40 border-none' {...field} placeholder="Ej: Partidos Destacados" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición</FormLabel>
                    <FormControl>
                      <Input
                      className='bg-secondary/40 border-none'
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={maxActual}
                        step={1}
                        {...field}
                        onChange={(e) => {
                          // Permitimos vacío para que el usuario pueda borrar y volver a tipear
                          if (e.target.value === '') {
                            // @ts-ignore
                            field.onChange('');
                            return;
                          }
                          const raw = Number(e.target.value);
                          const bounded = clamp(raw);
                          field.onChange(bounded);
                        }}
                        onBlur={(e) => {
                          // Al salir, si quedó vacío, lo mandamos al mínimo válido
                          if (e.target.value === '') {
                            field.onChange(1);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Bloquea caracteres no permitidos en números enteros positivos
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onWheel={(e) => {
                          // Evita cambiar el valor con la rueda del mouse
                          (e.target as HTMLInputElement).blur();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-secondary/40 border-none">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mostrar en Cartelera</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Define si este carrusel será visible en la página principal.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size="sm" className="mr-2" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
