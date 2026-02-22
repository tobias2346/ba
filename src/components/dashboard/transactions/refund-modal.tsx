"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: "total" | "partial") => void;
}

export function RefundModal({ isOpen, onClose, onConfirm }: RefundModalProps) {
  const [refundType, setRefundType] = useState<"total" | "partial">("total");

  // Opcional pero útil: cada vez que se abre, reseteo a "total"
  useEffect(() => {
    if (isOpen) setRefundType("total");
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // shadcn dialog llama esto al abrir y al cerrar.
        // Solo ejecutamos onClose cuando realmente se cierra.
        if (!open) onClose();
      }}
    >
      <DialogContent className="border-none">
        <DialogHeader>
          <DialogTitle>Seleccionar Tipo de Reembolso</DialogTitle>
          <DialogDescription>
            Elegí si deseas realizar un reembolso total o parcial de la
            transacción.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={refundType}
          onValueChange={(value: "total" | "partial") => setRefundType(value)}
          className="my-4 space-y-2"
        >
          <Label
            htmlFor="refund-total"
            className="flex items-center gap-2 p-4 border-none rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
          >
            <RadioGroupItem value="total" id="refund-total" />
            <div>
              <p className="font-semibold">Reembolso Total</p>
              <p className="text-sm text-muted-foreground">
                Se devolverá el importe completo de la compra.
              </p>
            </div>
          </Label>

          <Label
            htmlFor="refund-partial"
            className="flex items-center gap-2 p-4 border-none rounded-md cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary"
          >
            <RadioGroupItem value="partial" id="refund-partial" />
            <div>
              <p className="font-semibold">Reembolso Parcial</p>
              <p className="text-sm text-muted-foreground">
                Se devolverá el importe sin el costo de servicio.
              </p>
            </div>
          </Label>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={() => onConfirm(refundType)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Confirmar Reembolso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
