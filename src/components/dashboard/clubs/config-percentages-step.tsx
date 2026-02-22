
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Percent } from 'lucide-react';
import { useStores } from '@/contexts/stores-context';
import { Spinner } from '@/components/ui/spinner';

interface ConfigPercentagesStepProps {
  clubData: any;
  onUpdate: (updatedData: any) => void;
}

export function ConfigPercentagesStep({ clubData, onUpdate }: ConfigPercentagesStepProps) {
  const { updateStore, loading } = useStores();
  const [percentages, setPercentages] = useState({
      tickets: clubData.serviceCharge?.tickets || 0,
      combos: clubData.serviceCharge?.combos || 0,
  });

  const handlePercentageChange = (field: 'tickets' | 'combos', value: string) => {
    let numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) numericValue = 0;
    if (numericValue < 0) numericValue = 0;
    if (numericValue > 100) numericValue = 100;
    
    setPercentages(prev => ({ ...prev, [field]: numericValue }));
  };

  const handleSave = async () => {
    const payload = {
      serviceCharge: {
        tickets: Number(percentages.tickets),
        combos: Number(percentages.combos),
      }
    };
    const updatedStore = await updateStore(clubData.id, payload);
    if(updatedStore) {
        onUpdate(updatedStore);
    }
  };

  return (
    <Card className="mt-4 border-none bg-secondary/20">
      <CardHeader>
        <CardTitle>Costo de Servicio</CardTitle>
        <CardDescription>Define las comisiones por servicio que se aplicarán a las ventas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Costo del Servicio</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div className="space-y-2">
              <Label htmlFor="accessPercentage">Tickets</Label>
              <div className="relative">
                <Input
                  id="accessPercentage"
                  type="number"
                  value={percentages.tickets}
                  onChange={e => handlePercentageChange('tickets', e.target.value)}
                className="pl-4 pr-8 border-none bg-secondary/40"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comboPercentage">Combos/Mesas</Label>
              <div className="relative">
                <Input
                  id="comboPercentage"
                  type="number"
                  value={percentages.combos}
                  onChange={e => handlePercentageChange('combos', e.target.value)}
                  className="pl-4 pr-8 border-none bg-secondary/40"
                />
                 <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Spinner size='sm' className='mr-2' />}
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
