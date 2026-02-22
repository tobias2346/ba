
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Info, Upload, Image as ImageIcon, MapPin, Loader2, FileUp, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CategorySelect } from "./category-select";
import { useStores } from '@/contexts/stores-context';
import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { Spinner } from '@/components/ui/spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { getAddressText, toAddressObject } from '@/lib/address-helpers';
import { BannerUploader } from '@/components/shared/banner-uploader';


const generalConfigSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  phone: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida.'),
  address: z.any(),
  enabled: z.boolean(),
  logoFile: z.any().optional(),
});

type GeneralConfigFormData = z.infer<typeof generalConfigSchema>;

interface ConfigGeneralStepProps {
    clubData: any;
    onUpdate: (updatedData: any, logoFile?: File | null) => void;
}

export function ConfigGeneralStep({ clubData, onUpdate }: ConfigGeneralStepProps) {
  const { loading, updateStoreBanner, deleteStoreBanner } = useStores();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [addressQuery, setAddressQuery] = useState(getAddressText(clubData.address));
  const { suggestions, loading: loadingPlaces, selectPlace, clearSuggestions } = usePlacesAutocomplete(addressQuery);
  const [openAddress, setOpenAddress] = useState(false);


  const form = useForm<GeneralConfigFormData>({
    resolver: zodResolver(generalConfigSchema),
    defaultValues: {
      name: clubData.name || '',
      phone: clubData.phone || '',
      category: clubData.category?.id || '',
      address: toAddressObject(clubData.address),
      enabled: clubData.enabled || false,
      logoFile: null,
    },
  });

  useEffect(() => {
    setLogoPreview(clubData.logo || null);
    const addressAsObject = toAddressObject(clubData.address);
    form.reset({
      name: clubData.name || '',
      phone: clubData.phone || '',
      category: clubData.category?.id || '',
      address: addressAsObject,
      enabled: clubData.enabled || false,
      logoFile: null,
    });
    setAddressQuery(getAddressText(addressAsObject));
  }, [clubData, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        form.setValue('logoFile', file, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerSave = async () => {
    if (bannerFile) {
        const updatedStore = await updateStoreBanner(clubData.id, bannerFile);
        if (updatedStore) {
            onUpdate(updatedStore, null); // Pass null for logoFile to avoid re-uploading it
            setBannerFile(null); // Reset after upload
        }
    }
  }

  const handleBannerDelete = async () => {
      const success = await deleteStoreBanner(clubData.id);
      if(success) {
          onUpdate({ ...clubData, advertisingBanner: '' }, null);
          setBannerFile(null);
      }
  }


  const onSubmit = async (data: GeneralConfigFormData) => {
    const { logoFile, ...rest } = data;
    const updatedClub = await onUpdate(rest, logoFile);
    if(updatedClub) {
      form.reset(form.getValues());
    }
  };

  const handleAddressChange = (value: string) => {
    setAddressQuery(value);
    form.setValue('address', { description: value, place_id: '' }, { shouldDirty: true });
    if(value.trim().length >= 3) {
      setOpenAddress(true);
    } else {
      setOpenAddress(false);
      clearSuggestions();
    }
  };

  const handleSelectSuggestion = async (placeId: string, description: string) => {
    form.setValue('address', { description, place_id: placeId }, { shouldDirty: true });
    setAddressQuery(description);
    setOpenAddress(false);
    clearSuggestions();
  };
  
  const onKeyDownInput: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && openAddress) e.preventDefault();
  };
  
  const { isDirty } = form.formState;

  return (
    <Card className="border-none bg-secondary/20">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between">
        <div>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Ajustes generales de visibilidad y datos del club.</CardDescription>
        </div>
        <Form {...form}>
            <form>
                 <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                        <FormItem className='flex items-center gap-2 space-y-0'>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger type='button'>
                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Esto permite que el club aparezca en el listado de la App.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <FormLabel htmlFor="enabled-club" className="text-sm font-medium">Habilitar Club</FormLabel>
                            <FormControl>
                                <Switch
                                id="enabled-club"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                    />
            </form>
        </Form>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name"  render={({ field }) => (<FormItem><FormLabel>Nombre del Club</FormLabel><FormControl><Input className=' border-none bg-secondary/40' {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input className=' border-none bg-secondary/40' {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoría</FormLabel><CategorySelect value={field.value} onChange={field.onChange} /><FormMessage /></FormItem>)} />
              <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <Popover open={openAddress} onOpenChange={setOpenAddress}>
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <Input
                                value={addressQuery}
                                placeholder="Ej: Brandsen 805, CABA"
                                onChange={(e) => handleAddressChange(e.target.value)}
                                onFocus={() => { if (addressQuery.trim().length >= 3) setOpenAddress(true); }}
                                onKeyDown={onKeyDownInput}
                                autoComplete="off"
                                spellCheck={false}
                                className=' border-none bg-secondary/40'
                              />
                               {loadingPlaces && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                            </div>
                          </PopoverTrigger>
                           <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                              <Command>
                                <CommandInput placeholder="Buscar dirección..." />
                                <CommandList>
                                  {loadingPlaces ? (
                                    <CommandEmpty>Buscando direcciones...</CommandEmpty>
                                  ) : Array.isArray(suggestions) && suggestions.length > 0 ? (
                                    <CommandGroup heading="Sugerencias">
                                      {suggestions.map((s: any) => (
                                        <CommandItem
                                          key={s.place_id}
                                          value={s.description}
                                          onMouseDown={(e) => e.preventDefault()}
                                          onSelect={() => handleSelectSuggestion(s.place_id, s.description)}
                                          className="cursor-pointer"
                                        >
                                          <MapPin className="mr-2 h-4 w-4" />
                                          {s.description}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  ) : (
                                      addressQuery.length > 2 && <CommandEmpty>Sin resultados</CommandEmpty>
                                  )}
                                </CommandList>
                              </Command>
                          </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 space-y-2">
                    <BannerUploader
                        label="Banner Publicitario (Vertical)"
                        aspectRatio="1:3.75"
                        recommendation="Ej: 320x1200px"
                        onFileSelect={setBannerFile}
                        initialImageUrl={clubData.advertisingBanner}
                        previewWidth={80}
                        previewHeight={300}
                    />
                     <div className="flex justify-end gap-2">
                         {clubData.advertisingBanner && (
                            <Button type="button" variant="destructive" onClick={handleBannerDelete} disabled={loading}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Eliminar Banner
                            </Button>
                        )}
                        <Button type="button" onClick={handleBannerSave} disabled={loading || !bannerFile}>
                            {loading && <Spinner size='sm' className='mr-2'/>}
                            Guardar Banner
                        </Button>
                    </div>
                </div>

              <div className="md:col-span-2 space-y-2">
                <FormLabel>Logo del Club</FormLabel>
                <div className='flex items-center gap-4'>
                 {logoPreview ? (
                     <NextImage src={logoPreview} alt="Vista previa del logo" width={64} height={64} className="object-contain aspect-square" />
                 ) : (
                     <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                         <ImageIcon className="h-8 w-8 text-muted-foreground" />
                     </div>
                 )}
                 <div className='flex flex-col gap-1'>
                    <FormField
                        control={form.control}
                        name="logoFile"
                        render={() => (
                            <FormItem>
                            <FormControl>
                                <Button asChild variant="outline">
                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Subir Logo
                                        <input id="logo-upload" type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
                                    </label>
                                </Button>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <p className='text-xs text-muted-foreground'>1080x1080px recomendado</p>
                 </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
                <Button type='submit' disabled={loading || !isDirty}>
                  {loading && <Spinner size='sm' className='mr-2'/>}
                  Guardar Cambios
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
