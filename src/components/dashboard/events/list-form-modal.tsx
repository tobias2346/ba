

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLists } from '@/contexts/lists-context';
import { Spinner } from '@/components/ui/spinner';

interface ListFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  eventData?: any;
}

export function ListFormModal({ isOpen, onClose, initialData, eventData, fetchData }: ListFormModalProps) {
  const eventId = eventData.id;
  const { createList, updateList, loading } = useLists();
  const isEditing = !!initialData;
  const isSectorized = eventData?.type === 'sectorized' && eventData?.stadium?.sectors?.length > 0;
  const isNumerated = eventData?.type === 'numerated'
  const sectors = eventData?.stadium?.sectors || [];
  const sectorsNumerated = eventData?.catalogItems.filter(e => e.visible)

  const listFormSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido.'),
    capacity: z.coerce.number().min(1, 'La capacidad debe ser al menos 1.').max(500, 'La capacidad máxima es 500.'),
    private: z.boolean(),
    sectorId: z.string().optional(),
  });

  type ListFormData = z.infer<typeof listFormSchema>;

  const form = useForm<ListFormData>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: '',
      capacity: 1,
      private: false,
      sectorId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        form.reset({
          name: initialData.name,
          capacity: initialData.capacity?.base || 1,
          private: initialData.private,
          sectorId: initialData.sectorId || '',
        });
      } else {
        form.reset({
          name: '',
          capacity: 1,
          private: false,
          sectorId: '',
        });
      }
    }
  }, [isOpen, initialData, isEditing, form]);


  const onSubmit = async (data: ListFormData) => {
    if (isSectorized && !data.sectorId) {
      form.setError('sectorId', { message: 'Debes seleccionar un sector.' });
      return;
    }

    if (isNumerated && !data.sectorId) {
      form.setError('sectorId', { message: 'Debes seleccionar un sector.' });
      return;
    }

    const sector = eventData?.catalogItems.find(i => i.sectorId == data.sectorId)

    let success;
    let payload;

    if (isNumerated) {
      payload = {
        name: data.name,
        private: data.private,
        sectorId: data.sectorId,
        capacity: data.capacity,
        numerated: sector?.numerated || false,
      };
    } else if (isSectorized) {
      payload = {
        name: data.name,
        private: data.private,
        sectorId: data.sectorId,
        capacity: data.capacity,
      };
    } else {
      payload = {
        name: data.name,
        private: data.private,
        capacity: data.capacity,
      };
    }

    if (isEditing) {
      success = await updateList(initialData.id, payload);
    } else {
      success = await createList({ ...payload, eventId });
    }

    if (success) {
      onClose();
      fetchData()
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Lista de Invitados</DialogTitle>
          <DialogDescription>
            Completa los detalles de la lista.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de lista*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidad total*</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} min={1} max={500} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSectorized && (
              <FormField
                control={form.control}
                name="sectorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            {isNumerated && (
              <FormField
                control={form.control}
                name="sectorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar un sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sectorsNumerated.map((sector: any) => <SelectItem key={sector.id} value={sector.sectorId}>{sector.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="private"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Lista privada</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Sólo vos podrás ver el listado completo de invitados. Ellos no podrán ver quién forma parte de la lista.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size="sm" className="mr-2" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Lista'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
