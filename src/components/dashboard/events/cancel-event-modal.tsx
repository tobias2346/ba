
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface CancelEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (withRefund: boolean) => void;
  loading: boolean;
}

export function CancelEventModal({ isOpen, onClose, onConfirm, loading }: CancelEventModalProps) {
  const [refundOption, setRefundOption] = useState<'yes' | 'no'>('yes');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Evento</DialogTitle>
          <DialogDescription>
            Estás a punto de cancelar este evento. ¿Deseas reembolsar los accesos vendidos?
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={refundOption} onValueChange={(value: 'yes' | 'no') => setRefundOption(value)} className="my-4 space-y-2">
            <Label htmlFor="refund-yes" className="flex items-center gap-2 p-4 border rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                <RadioGroupItem value="yes" id="refund-yes" />
                <div>
                    <p className="font-semibold">Sí, reembolsar accesos</p>
                    <p className="text-sm text-muted-foreground">Se devolverá el importe a todos los compradores.</p>
                </div>
            </Label>
             <Label htmlFor="refund-no" className="flex items-center gap-2 p-4 border rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                <RadioGroupItem value="no" id="refund-no" />
                <div>
                    <p className="font-semibold">No reembolsar accesos</p>
                    <p className="text-sm text-muted-foreground">Los accesos no serán reembolsados automáticamente.</p>
                </div>
            </Label>
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cerrar</Button>
          <Button onClick={() => onConfirm(refundOption === 'yes')} disabled={loading}>
            {loading && <Spinner size="sm" className='mr-2' />}
            <DollarSign className="mr-2 h-4 w-4"/>
            Confirmar Cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
