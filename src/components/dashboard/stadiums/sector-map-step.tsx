'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Image as ImageIcon, X } from 'lucide-react';
import type { StadiumFormData } from '@/app/dashboard/stadiums/new/page';
import { Sector, StandDetail, RowDetail, StandType, StandOrientation } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SectorMapStepProps {
  formData: StadiumFormData;
  updateFormData: (newData: Partial<StadiumFormData>) => void;
}

const orientationOptions: StandOrientation[] = ['N', 'S', 'E', 'O'];
const quantityOptions = (n: number) => Array.from({ length: n }, (_, i) => (i + 1).toString());
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const standTypeLabels: Record<StandType, string> = {
  '1_bandeja': '1° Bandeja',
  '2_bandeja': '2° Bandeja',
  '3_bandeja': '3° Bandeja',
  'codo_norte': 'Codo Norte',
  'codo_sur': 'Codo Sur',
};

/**
 * IDs únicos y estables para keys de React.
 * - Usa crypto.randomUUID() cuando existe
 * - Fallback a string con timestamp+random
 */
const makeId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? (crypto.randomUUID() as string)
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/** Comparación segura de ids (número o string) */
const equalsId = (a: string | number, b: string | number) => String(a) === String(b);

/** True si el id está ausente o vacío (lo tratamos como inválido para keys) */
const isMissingId = (v: unknown) => v === undefined || v === null || v === '';

/**
 * Normaliza en profundidad: asigna id a todo lo que no tenga (stands, sectors, rows)
 * Devuelve { changed, patched }
 */
function normalizeFormIds(fd: StadiumFormData): { changed: boolean; patched: StadiumFormData } {
  let changed = false;

  // Clone superficial del form
  const patched: StadiumFormData = {
    ...fd,
    standDetails: Array.isArray(fd.standDetails) ? fd.standDetails.map(s => ({ ...s, sectors: Array.isArray(s.sectors) ? s.sectors.map(sec => ({ ...sec, rows: Array.isArray(sec.rows) ? sec.rows.map(r => ({ ...r })) : [] })) : [] })) : [],
    sectors: Array.isArray(fd.sectors) ? fd.sectors.map(s => ({ ...s, rows: Array.isArray(s.rows) ? s.rows.map(r => ({ ...r })) : [] })) : [],
  };

  // Numerated: standDetails -> sectors -> rows
  patched.standDetails = patched.standDetails.map((stand) => {
    const standCopy: StandDetail = { ...stand };

    if (isMissingId(standCopy.id)) {
      standCopy.id = makeId() as any;
      changed = true;
    }

    standCopy.sectors = (standCopy.sectors || []).map((sector) => {
      const sectorCopy: Sector = { ...sector };

      if (isMissingId(sectorCopy.id)) {
        sectorCopy.id = makeId() as any;
        changed = true;
      }

      sectorCopy.rows = (sectorCopy.rows || []).map((row) => {
        const rowCopy: RowDetail = { ...row };
        if (isMissingId(rowCopy.id)) {
          rowCopy.id = makeId() as any;
          changed = true;
        }
        return rowCopy;
      });

      return sectorCopy;
    });

    return standCopy;
  });

  // Sectorized: sectors (planos) -> rows
  patched.sectors = (patched.sectors || []).map((sector) => {
    const sectorCopy: Sector = { ...sector };

    if (isMissingId(sectorCopy.id)) {
      sectorCopy.id = makeId() as any;
      changed = true;
    }

    sectorCopy.rows = (sectorCopy.rows || []).map((row) => {
      const rowCopy: RowDetail = { ...row };
      if (isMissingId(rowCopy.id)) {
        rowCopy.id = makeId() as any;
        changed = true;
      }
      return rowCopy;
    });

    return sectorCopy;
  });

  return { changed, patched };
}

export function SectorMapStep({ formData, updateFormData }: SectorMapStepProps) {
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>(undefined);
  const [sectorMapImageUrl, setSectorMapImageUrl] = useState<string | null>(null);

  // Normalización defensiva: si llegan datos sin id desde fuera, los parchamos una vez
  const normalizedOnce = useRef(false);
  useEffect(() => {
    const { changed, patched } = normalizeFormIds(formData);
    if (changed) {
      updateFormData(patched);
      normalizedOnce.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]); // intencional: si vienen sin id, los completa; si ya tienen, no hace nada

  useEffect(() => {
    if (formData.sectorMapImage) {
      const url = URL.createObjectURL(formData.sectorMapImage);
      setSectorMapImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (formData.imageUrl) {
      setSectorMapImageUrl(formData.imageUrl);
    } else {
      setSectorMapImageUrl(null);
    }
  }, [formData.sectorMapImage, formData.imageUrl]);

  const handleStandCountChange = useCallback(
    (value: string) => {
      const count = parseInt(value, 10);
      const currentDetails = formData.standDetails || [];
      let newDetails: StandDetail[];

      if (count > currentDetails.length) {
        const toCreate = count - currentDetails.length;
        const newStands: StandDetail[] = Array.from({ length: toCreate }, (_, i) => ({
          id: makeId() as any,
          name: `Tribuna ${currentDetails.length + i + 1}`,
          orientation: null,
          type: null,
          sectors: [],
        }));
        newDetails = [...currentDetails, ...newStands];
      } else {
        newDetails = currentDetails.slice(0, count);
      }

      updateFormData({ standDetails: newDetails, standCount: count });
      setOpenAccordionItem(undefined);
    },
    [formData.standDetails, updateFormData]
  );

  const handleStandDetailChange = useCallback(
    (standId: string | number, field: keyof StandDetail, value: any) => {
      const updatedDetails = (formData.standDetails || []).map((stand) => {
        if (equalsId(stand.id as any, standId)) {
          const newStand: StandDetail = { ...stand, [field]: value } as any;

          // Cambiar orientación resetea tipo
          if (field === 'orientation') {
            newStand.type = null as any;
          }
          // Si es codo, forzar un sector "General"
          if (field === 'type' && typeof value === 'string' && value.startsWith('codo')) {
            const hasGeneral = (newStand.sectors || []).some(s => s.name === 'General');
            newStand.sectors = hasGeneral ? newStand.sectors : [{ id: makeId() as any, name: 'General', rows: [] }];
          }
          return newStand;
        }
        return stand;
      });

      updateFormData({ standDetails: updatedDetails });
    },
    [formData.standDetails, updateFormData]
  );

  const addRow = useCallback(
    (standId: string | number, sectorId: string | number) => {
      updateFormData({
        standDetails: (formData.standDetails || []).map((stand) => {
          if (equalsId(stand.id as any, standId)) {
            return {
              ...stand,
              sectors: (stand.sectors || []).map((sector) => {
                if (equalsId(sector.id as any, sectorId)) {
                  const nextRowName = alphabet[sector.rows.length] || `Fila ${sector.rows.length + 1}`;
                  const newRow: RowDetail = { id: makeId() as any, label: nextRowName, seatsCount: 10 };
                  return { ...sector, rows: [...sector.rows, newRow] };
                }
                return sector;
              }),
            };
          }
          return stand;
        }),
      });
    },
    [formData.standDetails, updateFormData]
  );

  const removeRow = useCallback(
    (standId: string | number, sectorId: string | number, rowId: string | number) => {
      updateFormData({
        standDetails: (formData.standDetails || []).map((stand) =>
          equalsId(stand.id as any, standId)
            ? {
              ...stand,
              sectors: (stand.sectors || []).map((sector) =>
                equalsId(sector.id as any, sectorId)
                  ? {
                    ...sector,
                    rows: sector.rows
                      .filter((row) => !equalsId(row.id as any, rowId))
                      .map((row, index) => ({ ...row, label: alphabet[index] || `Fila ${index + 1}` })),
                  }
                  : sector
              ),
            }
            : stand
        ),
      });
    },
    [formData.standDetails, updateFormData]
  );

  const handleRowChange = useCallback(
    (
      standId: string | number,
      sectorId: string | number,
      rowId: string | number,
      field: keyof RowDetail,
      value: string | number
    ) => {
      updateFormData({
        standDetails: (formData.standDetails || []).map((stand) => {
          if (equalsId(stand.id as any, standId)) {
            return {
              ...stand,
              sectors: (stand.sectors || []).map((sector) => {
                if (equalsId(sector.id as any, sectorId)) {
                  return {
                    ...sector,
                    rows: sector.rows.map((row) =>
                      equalsId(row.id as any, rowId) ? ({ ...row, [field]: value } as RowDetail) : row
                    ),
                  };
                }
                return sector;
              }),
            };
          }
          return stand;
        }),
      });
    },
    [formData.standDetails, updateFormData]
  );

  const handleSectorCountChange = useCallback(
    (standId: string | number, count: number) => {
      const updatedDetails = (formData.standDetails || []).map((stand) => {
        if (equalsId(stand.id as any, standId)) {
          let newSectors: Sector[] = Array.isArray(stand.sectors) ? [...stand.sectors] : [];
          if (count > newSectors.length) {
            const toAdd = count - newSectors.length;
            for (let i = 0; i < toAdd; i++) {
              newSectors.push({ id: makeId() as any, name: `Sector ${newSectors.length + 1}`, rows: [] });
            }
          } else {
            newSectors = newSectors.slice(0, count);
          }
          return { ...stand, sectors: newSectors };
        }
        return stand;
      });
      updateFormData({ standDetails: updatedDetails });
    },
    [formData.standDetails, updateFormData]
  );

  const handleSectorNameChange = useCallback(
    (standId: string | number, sectorId: string | number, name: string) => {
      const updatedDetails = (formData.standDetails || []).map((stand) => {
        if (equalsId(stand.id as any, standId)) {
          return {
            ...stand,
            sectors: (stand.sectors || []).map((sector) => (equalsId(sector.id as any, sectorId) ? { ...sector, name } : sector)),
          };
        }
        return stand;
      });
      updateFormData({ standDetails: updatedDetails });
    },
    [formData.standDetails, updateFormData]
  );

  const handleSectorMapImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData({ sectorMapImage: file, imageUrl: undefined });
    }
  };

  const handleSingleSectorNameChange = (id: string, name: string) => {
    const updatedSectors = (formData.sectors || []).map((sector) =>
      String(sector.id) === String(id) ? { ...sector, name } : sector
    );
    updateFormData({ sectors: updatedSectors });
  };

  const addSingleSector = () => {
    updateFormData({ sectors: [...(formData.sectors || []), { id: makeId(), name: '', rows: [] }] });
  };

  const removeSingleSector = (id: string) => {
    updateFormData({ sectors: (formData.sectors || []).filter((sector) => String(sector.id) !== String(id)) });
  };

  const usedTypes = useMemo(() => {
    const used: { [key in StandOrientation]?: StandType[] } = {};
    for (const stand of formData.standDetails || []) {
      if (stand.orientation && stand.type) {
        if (!used[stand.orientation]) {
          used[stand.orientation] = [];
        }
        used[stand.orientation]!.push(stand.type);
      }
    }
    return used;
  }, [formData.standDetails]);

  const getStandTypeOptions = (orientation: StandOrientation | null, currentStandId: string | number): { value: StandType; disabled: boolean }[] => {
    if (!orientation) return [];
    const options: StandType[] = ['1_bandeja', '2_bandeja', '3_bandeja', 'codo_norte', 'codo_sur'];

    const hasTray1 = (formData.standDetails || []).some((s) => s.orientation === orientation && s.type === '1_bandeja');
    const hasTray2 = (formData.standDetails || []).some((s) => s.orientation === orientation && s.type === '2_bandeja');
    const usedForOrientation = usedTypes[orientation] || [];
    const currentStand = (formData.standDetails || []).find((s) => equalsId(s.id as any, currentStandId));

    return options.map((type) => {
      const isUsed = usedForOrientation.includes(type) && type !== currentStand?.type;
      const isDisabled2ndTray = type === '2_bandeja' && !hasTray1;
      const isDisabled3rdTray = type === '3_bandeja' && (!hasTray1 || !hasTray2);

      let isDisabledCodo = false;
      if (orientation === 'N' || orientation === 'S') {
        isDisabledCodo = type.startsWith('codo');
      }

      return {
        value: type,
        disabled: isUsed || isDisabled2ndTray || isDisabled3rdTray || isDisabledCodo,
      };
    });
  };

  if (formData.segmentationType === 'numerated') {
    return (
      <div className="space-y-6">
        <div>
          <Label>Cantidad de Tribunas*</Label>
          <Select onValueChange={handleStandCountChange} value={formData.standCount.toString()}>
            <SelectTrigger className="w-full mt-2 border-none bg-light text-primary shadow-xl">
              <SelectValue placeholder="Seleccionar cantidad" />
            </SelectTrigger>
            <SelectContent className='border-none bg-secondary'>
              {quantityOptions(16).map((num) => (
                <SelectItem key={`stand-count-${num}`} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-4"
          value={openAccordionItem}
          onValueChange={setOpenAccordionItem}
        >
          {(formData.standDetails || []).map((detail) => (
            <AccordionItem key={`stand-${String(detail.id)}`} value={`stand-${String(detail.id)}`} className="rounded-md px-4 border-none bg-light text-primary shadow-xl">
              <AccordionTrigger className="hover:no-underline [&[data-state=open]]:pb-0">
                <span className="font-semibold">{detail.name || `Tribuna sin nombre`}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Nombre Tribuna*</Label>
                  <Input
                    className='border-none bg-light text-primary shadow-xl'
                    value={detail.name}
                    onChange={(e) => handleStandDetailChange(detail.id as any, 'name', e.target.value)}
                    placeholder="Ej: Platea Alta Sector A"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Orientación*</Label>
                  <Select
                    onValueChange={(val: StandOrientation) => handleStandDetailChange(detail.id as any, 'orientation', val)}
                    value={(detail.orientation as any) || undefined}
                  >
                    <SelectTrigger className='border-none bg-light text-primary shadow-xl'>
                      <SelectValue placeholder="Seleccionar orientación" />
                    </SelectTrigger>
                    <SelectContent className='border-none bg-secondary'>
                      {orientationOptions.map((name) => (
                        <SelectItem key={`orient-${name}`} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo*</Label>
                  <Select
                    onValueChange={(val: StandType) => handleStandDetailChange(detail.id as any, 'type', val)}
                    value={(detail.type as any) || ''}
                    disabled={!detail.orientation}
                  >
                    <SelectTrigger className='border-none bg-light text-primary shadow-xl'>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className='border-none bg-secondary'>
                      {getStandTypeOptions(detail.orientation, detail.id as any).map((opt) => (
                        <SelectItem key={`type-${String(detail.id)}-${opt.value}`} value={opt.value} disabled={opt.disabled}>
                          {standTypeLabels[opt.value] || (opt.value as string)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!detail.type?.startsWith('codo') && (
                  <div className="space-y-2">
                    <Label>Cantidad de Sectores*</Label>
                    <Select
                      onValueChange={(val) => handleSectorCountChange(detail.id as any, parseInt(val))}
                      value={detail.sectors?.length.toString() || '0'}
                    >
                      <SelectTrigger className='border-none bg-light text-primary shadow-xl'>
                        <SelectValue placeholder="Seleccionar cantidad" />
                      </SelectTrigger>
                      <SelectContent className='border-none bg-secondary'>
                        {[1, 2, 3].map((num) => (
                          <SelectItem key={`sec-count-${String(detail.id)}-${num}`} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(detail.sectors || []).map((sector, sectorIndex) => (
                  <div key={`sector-${String(sector.id)}`} className="space-y-2 border-t pt-4">
                    <Label>Nombre del Sector {sectorIndex + 1}*</Label>
                    <Input
                      className='border-none bg-light text-primary shadow-xl'
                      value={sector.name}
                      onChange={(e) => handleSectorNameChange(detail.id as any, sector.id as any, e.target.value)}
                      placeholder="Ej: Sector A"
                    />

                    <div className="space-y-2">
                      <Label>Filas*</Label>
                      <div
                        className={cn(
                          'space-y-3 rounded-md border p-4  border-none bg-light text-primary shadow-xl',
                          sector.rows.length === 0 && 'text-center text-sm text-muted-foreground py-6'
                        )}
                      >
                        {sector.rows.length === 0 && <p>Aún no has agregado filas.</p>}

                        {sector.rows.map((row) => (
                          <div key={String(row.id)} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                            <Input
                              className='border-none bg-light text-primary shadow-xl'
                              disabled
                              value={row.label}
                              onChange={(e) => handleRowChange(detail.id as any, sector.id as any, row.id as any, 'label', e.target.value)}
                              placeholder="Nombre Fila"
                            />
                            <Select
                              onValueChange={(val) =>
                                handleRowChange(detail.id as any, sector.id as any, row.id as any, 'seatsCount', parseInt(val, 10))
                              }
                              value={row.seatsCount.toString()}
                            >
                              <SelectTrigger className='border-none bg-light text-primary shadow-xl'>
                                <SelectValue placeholder="Asientos" />
                              </SelectTrigger>
                              <SelectContent className='border-none bg-secondary'>
                                {quantityOptions(100).map((num) => (
                                  <SelectItem key={`seats-${String(row.id)}-${num}`} value={num}>
                                    {`${num} asientos`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Button variant="ghost" size="icon" onClick={() => removeRow(detail.id as any, sector.id as any, row.id as any)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}

                        <Button variant="outline" size="sm" onClick={() => addRow(detail.id as any, sector.id as any)} className='border-none bg-secondary/70 hover:bg-primary'>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Agregar Fila
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  if (formData.segmentationType === 'sectorized') {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Cargar Imagen del Mapa*</Label>
          {sectorMapImageUrl ? (
            <Image src={sectorMapImageUrl} alt="Preview" width={400} height={225} className="rounded-md object-cover aspect-video" />
          ) : (
            <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <label htmlFor="sector-map-upload" className="cursor-pointer">
                <ImageIcon className="mr-2 h-4 w-4" />
                Seleccionar Imagen
              </label>
            </Button>
            <Input id="sector-map-upload" type="file" className="hidden" onChange={handleSectorMapImageChange} accept="image/*" />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Definir Sectores*</Label>

          {(formData.sectors || []).map((sector, index) => (
            <div key={`flat-sector-${String(sector.id)}`} className="flex items-center gap-2">
              <Input
                value={sector.name}
                onChange={(e) => handleSingleSectorNameChange(String(sector.id), e.target.value)}
                placeholder={`Nombre del Sector ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSingleSector(String(sector.id))}
                disabled={(formData.sectors || []).length <= 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addSingleSector}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Sector
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
