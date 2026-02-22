

'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CatalogPage({ params }: { params: { id: string } }) {
  const eventId = params.id;

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/events/${eventId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Volver al Evento
      </Link>
      <h1 className="text-3xl font-bold">Catálogo del Evento</h1>
      <p>ID del Evento: {eventId}</p>
      
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-6 py-20">
        <div className="flex flex-col items-center gap-4 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
                Gestión de Catálogo
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
                Aquí podrás añadir, editar y eliminar los tickets y combos para este evento.
            </p>
        </div>
      </div>
      
    </div>
  );
}
