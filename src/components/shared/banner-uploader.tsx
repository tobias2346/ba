
'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NextImage from 'next/image';
import { FileUp } from 'lucide-react';

interface BannerUploaderProps {
  label: string;
  aspectRatio: string;
  recommendation: string;
  onFileSelect: (file: File | null) => void;
  initialImageUrl?: string;
  previewWidth?: number;
  previewHeight?: number;
}

export function BannerUploader({ label, aspectRatio, recommendation, onFileSelect, initialImageUrl, previewWidth = 300, previewHeight = 150 }: BannerUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);

  useEffect(() => {
    setPreview(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onFileSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onFileSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <NextImage src={preview} alt="Vista previa" width={previewWidth} height={previewHeight} className="object-contain rounded-md mb-4" />
        ) : (
          <FileUp className="h-12 w-12 text-muted-foreground" />
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Arrastra y suelta una imagen aquí o haz clic para seleccionarla.
        </p>
        <Button variant="link" size="sm" asChild className='mt-2'>
          <label htmlFor={`banner-upload-${label.replace(/\s+/g, '-')}`}>Seleccionar archivo</label>
        </Button>
        <Input id={`banner-upload-${label.replace(/\s+/g, '-')}`} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        <p className='text-xs text-muted-foreground mt-1'>Relación de aspecto {aspectRatio} ({recommendation}).</p>
      </div>
    </div>
  );
}
