
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BannerUploader } from './banner-uploader';
import { useStores } from '@/contexts/stores-context';
import { Spinner } from '../ui/spinner';
import { Trash2 } from 'lucide-react';
import modalFeedbackReact from './feedback-modal';

interface BannerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BannerUploadModal({ isOpen, onClose }: BannerUploadModalProps) {
  const [secondaryBanner, setSecondaryBanner] = useState<File | null>(null);
  const { updateBrandBanner, deleteBrandBanner, getBrandBannerUrl, loading } = useStores();
  const [initialBannerUrl, setInitialBannerUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
        getBrandBannerUrl().then(url => setInitialBannerUrl(url));
    }
  }, [isOpen, getBrandBannerUrl]);

  const handleSave = async () => {
    if (secondaryBanner) {
        const success = await updateBrandBanner(secondaryBanner);
        if (success) {
            onClose();
        }
    }
  };

  const handleDelete = () => {
    modalFeedbackReact(
        'Confirmar Eliminación',
        '¿Estás seguro de que quieres eliminar el banner actual? Esta acción no se puede deshacer.',
        'warning',
        true,
        [{
            text: "Eliminar",
            action: async () => {
                const success = await deleteBrandBanner();
                if (success) {
                    setInitialBannerUrl("");
                    onClose();
                }
            },
            type: "primary",
        }]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Banner Publicitario</DialogTitle>
          <DialogDescription>
            Carga o actualiza el banner horizontal que se mostrará en la aplicación.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <BannerUploader
            label="Banner Secundario (Horizontal)"
            aspectRatio="8:1"
            recommendation="Ej: 1456x180px"
            onFileSelect={setSecondaryBanner}
            initialImageUrl={initialBannerUrl}
          />
        </div>
        <DialogFooter className="flex justify-between w-full">
            <div>
                 {initialBannerUrl && (
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Banner Actual
                    </Button>
                )}
            </div>
            <div className='flex gap-2'>
                <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button onClick={handleSave} disabled={loading || !secondaryBanner}>
                    {loading && <Spinner size="sm" className="mr-2" />}
                    Guardar Cambios
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
