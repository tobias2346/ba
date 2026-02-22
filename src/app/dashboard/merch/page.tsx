
import { Shirt, Construction } from 'lucide-react';

export default function MerchPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <Construction className="h-16 w-16 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">
          Merchandising Próximamente
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Esta sección está en construcción. Pronto podrás gestionar todo el merchandising de tus equipos desde aquí.
        </p>
      </div>
    </div>
  );
}
