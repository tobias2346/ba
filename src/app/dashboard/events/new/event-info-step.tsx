

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Info } from 'lucide-react';
import type { EventFormData } from '@/app/dashboard/events/new/page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EventInfoStepProps {
  formData: EventFormData;
  updateFormData: (newData: Partial<EventFormData>) => void;
  imageError: string | null;
}

export function EventInfoStep({ formData, updateFormData, imageError }: EventInfoStepProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(formData.flyerUrl || null);

  useEffect(() => {
    if (formData.image) {
      const url = URL.createObjectURL(formData.image);
      setImagePreview(url);
      
      return () => URL.revokeObjectURL(url);
    } else if (formData.flyerUrl) {
        setImagePreview(formData.flyerUrl);
    } else {
        setImagePreview(null);
    }
  }, [formData.image, formData.flyerUrl]);


  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    updateFormData({ [id]: value });
  }, [updateFormData]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData({ image: file });
    }
  }, [updateFormData]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="eventName">Nombre del Partido*</Label>
        <Input className='border-none bg-light text-primary shadow-xl' id="eventName" value={formData.eventName} onChange={handleInputChange} placeholder="Ej: Boca vs Regatas" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="eventDescription">Descripción*</Label>
        <Textarea className='border-none bg-light text-primary shadow-xl' id="eventDescription" value={formData.eventDescription} onChange={handleInputChange} placeholder="Describe los detalles del partido..." />
      </div>

      <div className="space-y-4">
        <Label>Imagen del Partido*</Label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="w-24 h-auto aspect-video rounded-md bg-muted flex items-center justify-center">
              <Image src={imagePreview} alt="Preview" width={90} height={50} className="rounded-md object-contain" />
            </div>
          ) : (
            <div className="w-24 h-auto aspect-video bg-muted rounded-md flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
           <div className="flex flex-col gap-1">
            <Button asChild variant="outline" className='border-none bg-light text-primary shadow-xl'>
              <label htmlFor="image-upload" className="cursor-pointer">
                <ImageIcon className="mr-2 h-4 w-4" />
                Seleccionar Imagen
              </label>
            </Button>
            <Input className='border-none bg-light text-primary shadow-xl' id="image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            <p className='text-xs text-muted-foreground'>Relación de aspecto 9:5 (Ej: 900x500px).</p>
          </div>
        </div>
        {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}
      </div>
    </div>
  );
}
