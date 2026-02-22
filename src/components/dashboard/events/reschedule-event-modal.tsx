
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useEffect, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes, isBefore, parseISO, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { parseCustomDateString } from '@/lib/utils';


const rescheduleSchema = z.object({
  startDate: z.date({ required_error: "La fecha de inicio es requerida."}),
  endDate: z.date({ required_error: "La fecha de fin es requerida."}),
}).refine(data => !isBefore(data.endDate, data.startDate), {
    message: "La fecha de fin no puede ser anterior a la de inicio.",
    path: ['endDate'],
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface RescheduleEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dates: { startDate: Date, endDate: Date }) => void;
  loading: boolean;
  initialData?: { startDate: string, endDate: string } | null;
}

export function RescheduleEventModal({ isOpen, onClose, onConfirm, loading, initialData }: RescheduleEventModalProps) {
  
  const form = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    }
  });
  
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = form;
  
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (initialData && isOpen) {
        const start = parseCustomDateString(initialData.startDate) || parseISO(initialData.startDate);
        const end = parseCustomDateString(initialData.endDate) || parseISO(initialData.endDate);
        reset({
            startDate: isValid(start) ? start : new Date(),
            endDate: isValid(end) ? end : new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        });
    }
  }, [initialData, isOpen, reset]);


  const setTime = (field: 'startDate' | 'endDate', hour: number, minute: number) => {
    const date = field === 'startDate' ? startDate : endDate;
    let next = setHours(date, hour);
    next = setMinutes(next, minute);
    setValue(field, next, { shouldValidate: true, shouldDirty: true });
  };
  
  const timeValues = {
    hInit: startDate.getHours(),
    mInit: startDate.getMinutes(),
    hEnd: endDate.getHours(),
    mEnd: endDate.getMinutes(),
  };
  
  const handleDateChange = useCallback((date: Date | undefined, field: 'startDate' | 'endDate') => {
      if (!date) return;
      const currentHours = field === 'startDate' ? timeValues.hInit : timeValues.hEnd;
      const currentMinutes = field === 'startDate' ? timeValues.mInit : timeValues.mEnd;
      let newDate = setHours(date, currentHours);
      newDate = setMinutes(newDate, currentMinutes);
      setValue(field, newDate, { shouldValidate: true, shouldDirty: true });
    }, [setValue, timeValues]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='border-none w-96 h-96'>
        <DialogHeader>
          <DialogTitle>Reprogramar Evento</DialogTitle>
          <DialogDescription>
            Selecciona la nueva fecha y hora para el inicio y fin del evento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label>Fecha y Hora de Inicio*</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, 'PPP HH:mm') : <span>Seleccionar</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                            <div className="p-3">
                                <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(d) => handleDateChange(d, 'startDate')}
                                initialFocus
                                disabled={{ before: new Date() }}
                                />
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Hora (HH)</Label>
                                    <Input
                                    type="number"
                                    min={0} max={23}
                                    value={timeValues.hInit}
                                    onChange={(e) => setTime('startDate', Number(e.target.value), timeValues.mInit)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Minuto (MM)</Label>
                                    <Input
                                    type="number"
                                    min={0} max={59}
                                    value={timeValues.mInit}
                                    onChange={(e) => setTime('startDate', timeValues.hInit, Number(e.target.value))}
                                    />
                                </div>
                                </div>
                            </div>
                            </PopoverContent>
                        </Popover>
                         {errors.startDate && <p className="text-sm font-medium text-destructive">{errors.startDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha y Hora de Fin*</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, 'PPP HH:mm') : <span>Seleccionar</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                            <div className="p-3">
                                <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(d) => handleDateChange(d, 'endDate')}
                                initialFocus
                                disabled={{ before: startDate || new Date() }}
                                />
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Hora (HH)</Label>
                                    <Input
                                    type="number"
                                    min={0} max={23}
                                    value={timeValues.hEnd}
                                    onChange={(e) => setTime('endDate', Number(e.target.value), timeValues.mEnd)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Minuto (MM)</Label>
                                    <Input
                                    type="number"
                                    min={0} max={59}
                                    value={timeValues.mEnd}
                                    onChange={(e) => setTime('endDate', timeValues.hEnd, Number(e.target.value))}
                                    />
                                </div>
                                </div>
                            </div>
                            </PopoverContent>
                        </Popover>
                        {errors.endDate && <p className="text-sm font-medium text-destructive">{errors.endDate.message}</p>}
                    </div>
                </div>

                <DialogFooter className='pt-4'>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cerrar</Button>
                    <Button type='submit' disabled={loading}>
                        {loading && <Spinner size="sm" className='mr-2' />}
                        Confirmar Reprogramación
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
