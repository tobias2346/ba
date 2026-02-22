
'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUI } from "@/contexts/ui-context";
import { useUser } from "@/contexts/user-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateQrCode } from "@/ai/flows/generate-qr-flow";
import { Spinner } from "../ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

export function QrModal() {
  const { isQrModalOpen, setIsQrModalOpen } = useUI();
  const { user } = useUser();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      if (isQrModalOpen && user?.alias) {
        setLoading(true);
        setError(null);
        setQrCodeUrl(null);
        try {
          const result = await generateQrCode({ alias: user.alias as string });
          if (result.qrCodeUrl) {
            setQrCodeUrl(result.qrCodeUrl);
          } else {
            setError(result.error || 'No se pudo generar el código QR.');
          }
        } catch (e: any) {
          setError(e.message || 'Ocurrió un error inesperado.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQrCode();

  }, [isQrModalOpen, user?.alias]);

  return (
    <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center">Tu QR de Acceso</DialogTitle>
          <DialogDescription className="text-center">
            Muestra este código para ingresar al evento. Es único y personal.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 min-h-[250px]">
          {loading && <Spinner size="lg" />}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {qrCodeUrl && (
            <div className="flex flex-col items-center gap-4">
              <Image src={qrCodeUrl} alt="QR Code" width={250} height={250} />
              <p className="font-mono text-lg text-primary">{user?.alias}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

