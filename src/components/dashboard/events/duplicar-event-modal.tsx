'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

interface DuplicarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    catalogItem: boolean,
    list: boolean,
    rrpp: boolean,
    image?: File | null,
    name?: string
  ) => void;
  loading: boolean;
  initialData?: {
    type?: string;
    flyerUrl?: string;
    name?: string;
  };
}

export function DuplicarEventModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  initialData
}: DuplicarEventModalProps) {
  // Estado del nombre
  const [name, setName] = useState(initialData?.name || '');

  // Estado de los checkboxes
  const [selected, setSelected] = useState({
    items: false,
    listas: false,
    rrpp: false,
  });

  // Estados para la imagen
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.flyerUrl || null
  );
  const [imageError, setImageError] = useState<string | null>(null);



  // Cambiar selección de checkboxes
  const handleChange = (field: 'items' | 'listas' | 'rrpp') => {
    setSelected((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Manejo de imagen
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación opcional (por ejemplo, tamaño máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('La imagen no debe superar los 5MB');
      return;
    }

    setImage(file);
    setImageError(null);
  }, []);

  // Enviar datos al confirmar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setImageError('El nombre del evento es obligatorio');
      return;
    }

    if (initialData?.type === 'numerated') {
      onConfirm(false, selected.listas, selected.rrpp, image, name.trim());
      return;
    }

    onConfirm(selected.items, selected.listas, selected.rrpp, image, name.trim());
  };

  // Actualiza la vista previa cuando cambia la imagen
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (initialData?.flyerUrl) {
      setImagePreview(initialData.flyerUrl);
    } else {
      setImagePreview(null);
    }
  }, [image, initialData?.flyerUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-none w-96 h-auto">
        <DialogHeader>
          <DialogTitle>Duplicar Evento</DialogTitle>
          <DialogDescription>
            Completa la información del nuevo evento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Campo de nombre */}
          <div className="space-y-2">
            <Label htmlFor="eventName">Nombre del evento*</Label>
            <Input
              id="eventName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Boca vs Regatas"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-3">
            {initialData?.type !== 'numerated' && (
              <Label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.items}
                  onChange={() => handleChange('items')}
                  className="h-4 w-4 accent-primary"
                />
                <span>Items</span>
              </Label>
            )}

            <Label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.listas}
                onChange={() => handleChange('listas')}
                className="h-4 w-4 accent-primary"
              />
              <span>Listas</span>
            </Label>

            <Label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.rrpp}
                onChange={() => handleChange('rrpp')}
                className="h-4 w-4 accent-primary"
              />
              <span>RRPP</span>
            </Label>

            {/* Imagen */}
            <div className="space-y-4 pt-2">
              <Label>Imagen del Partido*</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="w-24 h-auto aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={90}
                      height={50}
                      className="rounded-md object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-auto aspect-video bg-muted rounded-md flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <Button asChild variant="outline">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Seleccionar Imagen
                    </label>
                  </Button>
                  <Input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <p className="text-xs text-muted-foreground">
                    Relación de aspecto 9:5 (Ej: 900x500px).
                  </p>
                </div>
              </div>
              {imageError && (
                <p className="text-sm font-medium text-destructive">
                  {imageError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type='button' onClick={onClose} disabled={loading}>
              Cerrar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner size="sm" className="mr-2" />}
              Duplicar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
