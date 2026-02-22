

'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import type { EventFormData } from '@/app/dashboard/events/new/page';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AddressText } from '@/components/ui/address-text';
import { useEffect, useState } from 'react';

interface EventSummaryStepProps {
  formData: EventFormData;
}

export function EventSummaryStep({ formData }: EventSummaryStepProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (formData.image) {
      const url = URL.createObjectURL(formData.image);
      setImagePreview(url);
      
      // Limpiar la URL del objeto cuando el componente se desmonte o la imagen cambie
      return () => URL.revokeObjectURL(url);
    } else if (formData.flyerUrl) {
      setImagePreview(formData.flyerUrl);
    } else {
      setImagePreview(null);
    }
  }, [formData.image, formData.flyerUrl]);

  return (
    <div className="space-y-6">
      {imagePreview && (
        <Image src={imagePreview} alt={formData.eventName} width={600} height={338} className="rounded-lg object-cover w-full aspect-video" />
      )}
      <h2 className="text-3xl font-bold font-headline">{formData.eventName}</h2>
      <p className="text-muted-foreground">{formData.eventDescription}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
        <div>
          <h3 className="font-semibold text-sm">INICIO</h3>
          <p>{formData.dateInit ? format(formData.dateInit, "EEE, dd MMM, yyyy 'a las' HH:mm 'hs'") : 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-sm">FIN</h3>
          <p>{formData.dateEnd ? format(formData.dateEnd, "EEE, dd MMM, yyyy 'a las' HH:mm 'hs'") : 'N/A'}</p>
        </div>
         <div className="md:col-span-2">
            <h3 className="font-semibold text-sm">DIRECCIÓN</h3>
            <p><AddressText value={formData.address} /></p>
        </div>
      </div>
      
      <div className="space-y-3 rounded-lg bg-muted/50 p-4">
        <h3 className="font-semibold text-sm mb-2">CONFIGURACIÓN</h3>
        <div className="flex items-center gap-2">
            <CheckCircle className={cn("h-5 w-5", formData.includesMembers ? 'text-green-500' : 'text-muted-foreground')} />
            <span>{formData.includesMembers ? 'Incluye Abonados' : 'No incluye Abonados'}</span>
        </div>
         <div className="flex items-center gap-2">
            <CheckCircle className={cn("h-5 w-5", formData.stadiumId ? 'text-green-500' : 'text-muted-foreground')} />
            <span>{formData.stadiumId ? `Estadio incluido` : 'No incluye estadio'}</span>
        </div>
      </div>

       {formData.includeStadium && formData.stadiumId && formData.standDetails.length > 0 && (
        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
          <h3 className="font-semibold text-sm mb-2">DETALLES DEL ESTADIO</h3>
            {formData.standDetails.map((stand, index) => (
                <div key={stand.id}>
                    <p className='font-medium'>{stand.name}: <span className='font-normal text-muted-foreground'>{stand.rows.length} filas</span></p>
                    <ul className='list-disc list-inside pl-4 text-muted-foreground text-sm'>
                      {stand.rows.map(row => (
                        <li key={row.id}>{row.name}: {row.seats} asientos</li>
                      ))}
                    </ul>
                    {index < formData.standDetails.length - 1 && <Separator className="my-2" />}
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

    
