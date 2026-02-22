
'use client';

import { useUser } from "@/contexts/user-context";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import CommonModal from "../common/common-modal";

export function VerifyEmailModal() {
  const { user, resendVerificationEmail, actionLoading } = useUser();
  const [open, setOpen] = useState(false);

  const handleResend = () => {
    if (user) {
      resendVerificationEmail(user);
    }
  };

  return (
    <CommonModal open={open} setOpen={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center">
          <div className="bg-primary/10 rounded-full p-3">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-headline">Verifica tu Correo Electrónico</DialogTitle>
          <DialogDescription className="text-center">
            Para continuar, por favor revisa tu bandeja de entrada y sigue las instrucciones para verificar tu cuenta. Esto es necesario para asegurar tu cuenta y acceder a todas las funcionalidades.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
          <Button onClick={handleResend} disabled={actionLoading}>
            {actionLoading && <Spinner size="sm" className="mr-2" />}
            Reenviar Correo de Verificación
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={actionLoading}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </CommonModal>
  );
}
