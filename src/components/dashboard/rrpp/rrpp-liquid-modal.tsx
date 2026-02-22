'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isBefore } from 'date-fns';
import type { RRPP } from '@/contexts/rrpp-context';

const schema = z
  .object({
    startDate: z.date({ required_error: 'La fecha de inicio es obligatoria' }),
    endDate: z.date({ required_error: 'La fecha de fin es obligatoria' }),
  })
  .refine((d) => !isBefore(d.endDate, d.startDate), {
    path: ['endDate'],
    message: 'La fecha de fin no puede ser anterior a la de inicio',
  });

type FormData = z.infer<typeof schema>;

type LiquidRRPPModalProps = {
  open: boolean;
  rrpp: Pick<RRPP, 'id' | 'name' | 'lastName'> | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (data: { startDate: string; endDate: string }) => void;
};

export function LiquidRRPPModal({
  open,
  rrpp,
  loading = false,
  onCancel,
  onConfirm,
}: LiquidRRPPModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const submit = (data: FormData) => {
  onConfirm(format(data.startDate, 'yyyy-MM-dd'), format(data.endDate, 'yyyy-MM-dd'));

  };

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && !o && onCancel()}>
      <DialogContent className="border-none w-96">
        <DialogHeader>
          <DialogTitle>Liquidar RRPP</DialogTitle>
          <DialogDescription>
            {rrpp ? (
              <>
                Descargá las ventas de{' '}
                <b>
                  {rrpp.name} {rrpp.lastName}
                </b>{' '}
                en el rango seleccionado.
              </>
            ) : (
              'Seleccioná un rango de fechas'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* Fecha inicio */}
          <div className="space-y-2">
            <Label>Fecha inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => d && setValue('startDate', d, { shouldValidate: true })}
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate.message}</p>
            )}
          </div>

          {/* Fecha fin */}
          <div className="space-y-2">
            <Label>Fecha fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => d && setValue('endDate', d, { shouldValidate: true })}
                  disabled={{ before: startDate }}
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !rrpp}>
              {loading && <Spinner size="sm" className="mr-2" />}
              Descargar Excel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LiquidRRPPModal;
