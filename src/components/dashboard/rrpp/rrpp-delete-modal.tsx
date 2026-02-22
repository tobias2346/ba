'use client';

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
import type { RRPP } from '@/contexts/rrpp-context';

type DeleteRRPPModalProps = {
  open: boolean;
  rrpp: Pick<RRPP, 'id' | 'name' | 'lastName'> | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteRRPPModal({
  open,
  rrpp,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteRRPPModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !loading && !o && onCancel()}>
      <DialogContent className='bg-background border-none'>
        <DialogHeader>
          <DialogTitle>Eliminar RRPP</DialogTitle>
          <DialogDescription>
            {rrpp ? (
              <>
                ¿Seguro que querés eliminar a <b>{rrpp.name} {rrpp.lastName}</b>?<br />
                Esta acción marcará al RRPP como eliminado.
              </>
            ) : (
              '¿Seguro que querés eliminar este RRPP?'
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Spinner size="sm" className="mr-2" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteRRPPModal;
