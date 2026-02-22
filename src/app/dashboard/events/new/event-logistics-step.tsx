

'use client';

import React from 'react';
import { format, setHours, setMinutes, isBefore } from 'date-fns';
import { Calendar as CalendarIcon, HelpCircle, MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EventFormData } from './page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useStadiums } from '@/contexts/stadiums-context';
import { useSearchParams } from 'next/navigation';
import { getAddressText, toAddressObject } from '@/lib/address-helpers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EventLogisticsStepProps {
  formData: EventFormData;
  updateFormData: (newData: Partial<EventFormData>) => void;
  isEditing: boolean;
  errors: { [key: string]: string };
}

export function EventLogisticsStep({ formData, updateFormData, isEditing, errors }: EventLogisticsStepProps) {
  const { stadiums, getStadiums, loading: stadiumsLoading } = useStadiums();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId') as string;

  React.useEffect(() => {
    if (formData.includeStadium && storeId) getStadiums(storeId);
  }, [formData.includeStadium, storeId, getStadiums]);

  // ---------- Address (solo estado local al tipear) ----------
  const [addressQuery, setAddressQuery] = React.useState<string>(() => getAddressText(formData.address));
  const [open, setOpen] = React.useState(false);
  const { suggestions, loading, clearSuggestions } = usePlacesAutocomplete(addressQuery);

  // Sync visual si cambia desde afuera (edición/carga)
  React.useEffect(() => {
    setAddressQuery(getAddressText(formData.address));
  }, [formData.address]);

  const handleAddressChange = (value: string) => {
    setAddressQuery(value);
    setOpen(value.trim().length >= 3);
    if (value.trim().length < 3) clearSuggestions();
    // NO persistimos en formData hasta seleccionar opción
  };

  const handleSelectSuggestion = (placeId: string, description: string) => {
    updateFormData({ address: toAddressObject({ description, place_id: placeId }) });
    setAddressQuery(description);
    setOpen(false);
    clearSuggestions();
  };

  const clearAddress = () => {
    setAddressQuery('');
    updateFormData({ address: toAddressObject({ description: '', place_id: '' }) });
    clearSuggestions();
    setOpen(false);
  };

  const onKeyDownInput: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && open) e.preventDefault();
  };

  // ---------- Date / Time ----------
  const handleSwitchChange = React.useCallback(
    (checked: boolean, field: keyof EventFormData) => {
      const changes: Partial<EventFormData> = { [field]: checked };
      if (field === 'includeStadium' && !checked) {
        changes.stadiumId = null as any;
        (changes as any).standDetails = [];
      }
      updateFormData(changes);
    },
    [updateFormData]
  );

  const handleDateChange = React.useCallback(
    (date: Date | undefined, field: 'dateInit' | 'dateEnd') => {
      if (!date) return;
      const currentHours = formData[field]?.getHours() ?? 0;
      const currentMinutes = formData[field]?.getMinutes() ?? 0;
      let newDate = setHours(date, currentHours);
      newDate = setMinutes(newDate, currentMinutes);
      updateFormData({ [field]: newDate });
    },
    [formData, updateFormData]
  );

  const setTime = (field: 'dateInit' | 'dateEnd', hour: number, minute: number) => {
    const date = formData[field] ?? new Date();
    let next = setHours(date, hour);
    next = setMinutes(next, minute);
    updateFormData({ [field]: next });
  };

  const timeValues = React.useMemo(() => {
    const hInit = formData.dateInit?.getHours() ?? 0;
    const mInit = formData.dateInit?.getMinutes() ?? 0;
    const hEnd = formData.dateEnd?.getHours() ?? 0;
    const mEnd = formData.dateEnd?.getMinutes() ?? 0;
    return { hInit, mInit, hEnd, mEnd };
  }, [formData.dateInit, formData.dateEnd]);

  const handleStadiumChange = (stadiumId: string) => {
    const selectedStadium = stadiums.find((s) => s.id === stadiumId);
    updateFormData({ stadiumId, standDetails: (selectedStadium as any)?.layout || [] } as any);
  };

  return (
    <div className="space-y-6">
      {/* Dirección con Combobox */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección*</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                id="address"
                value={addressQuery}
                className='border-none bg-secondary/20'
                placeholder="Ej: Brandsen 805, CABA"
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => {
                  if (addressQuery.trim().length >= 3) setOpen(true);
                }}
                onKeyDown={onKeyDownInput}
                autoComplete="off"
                spellCheck={false}
              />
              {addressQuery && !loading && (
                <button
                  type="button"
                  onClick={clearAddress}
                  className="absolute right-8 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  aria-label="Borrar dirección"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {loading && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </PopoverTrigger>

          <PopoverContent
            className="p-0 w-[var(--radix-popover-trigger-width)] border-none bg-secondary/20'"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                {loading ? (
                  <CommandEmpty>Buscando direcciones…</CommandEmpty>
                ) : Array.isArray(suggestions) && suggestions.length > 0 ? (
                  <CommandGroup heading="Sugerencias">
                    {suggestions.map((s) => (
                      <CommandItem
                        key={s.place_id}
                        value={s.description}
                        onMouseDown={(e) => e.preventDefault()}
                        onSelect={() => handleSelectSuggestion(s.place_id, s.description)}
                        className="cursor-pointer"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="truncate">{s.description}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty>Sin resultados</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.address && <p className="text-sm font-medium text-destructive">{errors.address}</p>}
      </div>

      {/* Fecha y Hora de Inicio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha y Hora de Inicio*</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-none bg-secondary/20",
                  !formData.dateInit && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateInit
                  ? format(formData.dateInit, "PPP HH:mm")
                  : <span>Seleccionar</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Seleccionar fecha y hora</DialogTitle>
              </DialogHeader>
              <div className="p-3">
                <Calendar
                  mode="single"
                  selected={formData.dateInit ?? undefined}
                  onSelect={(d) => handleDateChange(d, "dateInit")}
                  initialFocus
                  disabled={{ before: new Date() }}
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Hora (HH)</Label>
                    <Input
                      type="number"
                      className='border-none bg-secondary/20'
                      min={0}
                      max={23}
                      value={timeValues.hInit}
                      onChange={(e) =>
                        setTime("dateInit", Number(e.target.value), timeValues.mInit)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Minuto (MM)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={timeValues.mInit}
                      onChange={(e) =>
                        setTime("dateInit", timeValues.hInit, Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {errors.dateInit && <p className="text-sm font-medium text-destructive">{errors.dateInit}</p>}
        </div>

        {/* Fecha y Hora de Fin */}
        <div className="space-y-2">
          <Label>Fecha y Hora de Fin*</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-none bg-secondary/20",
                  !formData.dateEnd && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateEnd
                  ? format(formData.dateEnd, "PPP HH:mm")
                  : <span>Seleccionar</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm ">
              <DialogHeader>
                <DialogTitle>Seleccionar fecha y hora de finalización</DialogTitle>
              </DialogHeader>

              <div className="p-3">
                <Calendar
                  mode="single"
                  selected={formData.dateEnd ?? undefined}
                  onSelect={(d) => handleDateChange(d, "dateEnd")}
                  initialFocus
                  disabled={{ before: formData.dateInit || new Date() }}
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Hora (HH)</Label>
                    <Input
                      type="number"
                      className='border-none bg-secondary/20'
                      min={0}
                      max={23}
                      value={timeValues.hEnd}
                      onChange={(e) =>
                        setTime("dateEnd", Number(e.target.value), timeValues.mEnd)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Minuto (MM)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={timeValues.mEnd}
                      onChange={(e) =>
                        setTime("dateEnd", timeValues.hEnd, Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog> 
          {errors.dateEnd && <p className="text-sm font-medium text-destructive">{errors.dateEnd}</p>}
        </div>
      </div>

      {/* Switches y Estadio */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <Switch id="includesMembers" checked={false} disabled={true} onCheckedChange={(c) => handleSwitchChange(c, 'includesMembers')} />
          <Label htmlFor="includesMembers">Incluye Abonados</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger type="button">
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Los abonados del club tendrán acceso a este evento. (próximamente)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="includeStadium" checked={formData.includeStadium} onCheckedChange={(c) => handleSwitchChange(c, 'includeStadium')} disabled={isEditing} />
          <Label htmlFor="includeStadium">Incluir Estadio</Label>
        </div>

        {formData.includeStadium && !isEditing && (
          <div className="pl-0 md:pl-8 pt-2">
            <Label>Estadio</Label>
            {stadiumsLoading ? <p>Cargando estadios...</p> : stadiums.length > 0 ? (
              <Select onValueChange={handleStadiumChange} value={formData.stadiumId || undefined} disabled={isEditing}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Seleccionar estadio" />
                </SelectTrigger>
                <SelectContent>
                  {stadiums.map((stadium) => (
                    <SelectItem key={stadium.id} value={stadium.id}>
                      {stadium.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Alert className="mt-2">
                <AlertDescription>
                  No hay estadios disponibles para este club.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
