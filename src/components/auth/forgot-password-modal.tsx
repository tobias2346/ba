
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/user-context";
import { Spinner } from "../ui/spinner";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import CommonModal from "../common/common-modal";

const entorno = process.env.NEXT_PUBLIC_ENTORNO;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const { actionLoading, sendRecoveryEmail } = useUser();

  const handleSendRequest = async () => {
    if (email && email.includes("@")) {
      const success = await sendRecoveryEmail({ email: email });
      if (success) {
        onClose();
        setEmail('');
      }
    } else {
      toast.error("Por favor, ingrese un email válido.");
    }
  };

  return (
    <CommonModal open={isOpen} setOpen={onClose}>
      <div className="sm:max-w-md">
        <div className="items-center text-center">
          <KeyRound className="h-12 w-12 text-primary mb-4" />
          <div className="text-2xl font-headline">Recuperar Contraseña</div>
          <p>
            Ingresa tu correo electrónico y te enviaremos un enlace para que puedas restablecer tu contraseña.
          </p>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSendRequest} disabled={actionLoading || !email}>
            {actionLoading && <Spinner size="sm" className="mr-2" />}
            Enviar
          </Button>
        </div>
      </div>
    </CommonModal>
  );
}
