
'use client';

import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MoreVertical, MapPin, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user-context';
import { parseCustomDateString } from '@/lib/utils';
import { getAddressText } from '@/lib/address-helpers';


interface EventHeaderProps {
  eventData: {
    name: string;
    state: string;
    flyer: string;
    startDate: string;
    endDate: string;
    address: any;
    description: string;
    verified: boolean;
    soldOut?: boolean;
  };
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch ((status || '').toLowerCase()) {
    case 'activo':
    case 'in progress':
      return 'default';
    case 'finalizado':
    case 'ended':
    case 'finished':
      return 'secondary';
    case 'not started':
    case 'borrador':
    case 'soon':
      return 'outline';
    case 'unverified':
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const translateStatus = (status: string): string => {
    const lowerCaseStatus = (status || '').toLowerCase();
    switch (lowerCaseStatus) {
        case 'unverified': return 'Sin verificar';
        case 'not started': return 'Sin iniciar';
        case 'in progress': return 'En curso';
        case 'ended': return 'Finalizado';
        case 'activo': return 'Activo';
        case 'finalizado': return 'Finalizado';
        case 'soon': return 'Próximamente';
        case 'finished': return 'Finalizado';
        case 'canceled': return 'Cancelado';
        default: return status;
    }
}


export function EventHeader({ eventData }: EventHeaderProps) {
  const { user } = useUser();
  const canVerify = user?.role === 'super-admin' || user?.role === 'admin';

  const shortAddress = (address: any) => {
    const addressText = getAddressText(address);
    if (!addressText) return 'Sin dirección';
    const parts = addressText.split(',');
    return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : addressText;
  }
  
  const formatDateRange = (startStr: string, endStr: string) => {
    try {
        const start = parseCustomDateString(startStr) || parseISO(startStr);
        const end = parseCustomDateString(endStr) || parseISO(endStr);
        
        const formattedStart = format(start, "dd MMM - HH:mm", { locale: es });
        const formattedEnd = format(end, "HH:mm", { locale: es });
        return `${formattedStart} a ${formattedEnd} hs`;
    } catch (error) {
        return 'Fechas inválidas'
    }
  }

  return (
    <div className="bg-secondary/20 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/3 flex items-center justify-center bg-black/20 p-4">
             <Image 
                src={eventData.flyer || 'https://placehold.co/600x400.png'} 
                alt={eventData.name} 
                width={400} 
                height={400} 
                className="object-contain h-full w-full"
                data-ai-hint="basketball game"
             />
        </div>
        <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div>
                <div className='flex items-center justify-between'>
                    <h1 className="text-2xl lg:text-3xl font-headline font-bold">{eventData.name}</h1>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusVariant(eventData.state)}>{translateStatus(eventData.state)}</Badge>
                     {eventData.soldOut && (
                        <Badge variant="destructive">
                            Sold Out
                        </Badge>
                    )}
                </div>
                
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{eventData.description}</p>

            </div>

            <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateRange(eventData.startDate, eventData.endDate)}</span>
                </div>
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{shortAddress(eventData.address)}</span>
                </div>
            </div>
        </div>
    </div>
  );
}
