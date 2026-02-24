
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Building, Image as ImageIcon, Upload, MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import NextImage from 'next/image';
import { CategorySelect } from '@/components/dashboard/clubs/category-select';
import { useStores } from '@/contexts/stores-context';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const registerSchema = z.object({
  country: z.string().min(1, 'El país es requerido.'),
  taxId: z.string().min(1, 'El CUIT/NIF/TIN es requerido.'),
  name: z.string().min(1, 'El nombre del club es requerido.').max(50, 'El nombre no puede exceder los 50 caracteres.'),
  address: z.any().refine(data => data && data.description, { message: "La dirección es requerida." }),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido.'),
  logoFile: z.any()
    .refine(file => file, "El logo es requerido.")
    .refine(file => file?.size <= 1024 * 1024, `El tamaño máximo es 1MB.`)
    .refine(file => file?.type.startsWith("image/"), "Solo se admiten imágenes.")
    .refine(async (file) => {
        if (!file) return false;
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
        URL.revokeObjectURL(image.src);
        return image.width === 1080 && image.height === 1080;
    }, "La imagen debe ser de 1080x1080px."),
  category: z.string().min(1, 'La categoría es requerida.'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones.'
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function NewClubPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { createStore, loading } = useStores();
  const router = useRouter();
  const [addressQuery, setAddressQuery] = useState('');
  const [openAddress, setOpenAddress] = useState(false);
  const { suggestions, loading: loadingPlaces, selectPlace, clearSuggestions } = usePlacesAutocomplete(addressQuery);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: 'ARGENTINA',
      taxId: '',
      name: '',
      address: { description: '', place_id: '' },
      city: '',
      phone: '',
      email: '',
      acceptTerms: false,
      category: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const payload = {
      ...data,
      address: data.address.description
    }
    const success = await createStore(payload);
    if(success) {
      router.push('/dashboard/clubs');
    }
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        form.setValue('logoFile', file, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (value: string) => {
    setAddressQuery(value);
    setOpenAddress(value.trim().length >= 3);
    if (value.trim().length < 3) clearSuggestions();
  };

  const handleSelectSuggestion = async (placeId: string, description: string) => {
    form.setValue('address', { description, place_id: placeId }, { shouldValidate: true });
    setAddressQuery(description);
    setOpenAddress(false);
    clearSuggestions();
  };

  const onKeyDownInput: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && openAddress) e.preventDefault();
  };


  return (
    <div className="md:container mx-auto py-8 ">
      <div className="mb-6">
        <Link href="/dashboard/clubs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver a Clubes
        </Link>
      </div>
      <Card className="max-w-2xl mx-auto border-none bg-light text-primary shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Crear Nuevo Club</CardTitle>
          <CardDescription>Completa el formulario para registrar un nuevo club en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nombre del Club*</FormLabel>
                      <FormControl>
                        <Input className='border-none bg-light text-primary shadow-xl' placeholder="Ej: Club Atlético Boca Juniors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>País*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger className='border-none bg-light text-primary shadow-xl'>
                                <SelectValue placeholder="Seleccioná tu país" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className='border-none bg-secondary'>
                                <SelectItem value="ARGENTINA">Argentina</SelectItem>
                                <SelectItem value="BRASIL">Brasil</SelectItem>
                                <SelectItem value="ESPAÑA">España</SelectItem>
                                <SelectItem value="EEUU">EEUU</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría*</FormLabel>
                        <CategorySelect 
                          value={field.value}
                          onChange={field.onChange}
                        />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CUIT / Identificador Fiscal*</FormLabel>
                      <FormControl>
                        <Input className='border-none bg-light text-primary shadow-xl' placeholder="Ej: 30-12345678-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección*</FormLabel>
                      <Popover open={openAddress} onOpenChange={setOpenAddress}>
                          <PopoverTrigger asChild>
                            <div className="relative">
                              <Input
                              className='border-none bg-light text-primary shadow-xl'
                                value={addressQuery}
                                placeholder="Ej: Brandsen 805, CABA"
                                onChange={(e) => handleAddressChange(e.target.value)}
                                onFocus={() => { if (addressQuery.trim().length >= 3) setOpenAddress(true); }}
                                onKeyDown={onKeyDownInput}
                                autoComplete="off"
                                spellCheck={false}
                              />
                               {loadingPlaces && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                            </div>
                          </PopoverTrigger>
                           <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                              <Command>
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
                                      <CommandEmpty>Sin resultados</CommandEmpty>
                                  )}
                                </CommandList>
                              </Command>
                          </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input className='border-none bg-light text-primary shadow-xl' placeholder="Ej: CABA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input className='border-none bg-light text-primary shadow-xl' placeholder="Ej: 11-4309-4700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email de Contacto*</FormLabel>
                      <FormControl>
                        <Input className='border-none bg-light text-primary shadow-xl' type="email" placeholder="contacto@club.com" {...field} />
                      </FormControl>
                       <p className="text-xs text-muted-foreground">A este email llegarán las notificaciones importantes.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2 space-y-2">
                   <FormLabel>Logo del Club*</FormLabel>
                   <div className='flex flex-col md:flex-row items-center gap-4'>
                    {logoPreview ? (
                        <NextImage src={logoPreview} alt="Vista previa del logo" width={64} height={64} className="rounded-full bg-muted object-contain aspect-square" />
                    ) : (
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                    <div className='flex flex-col gap-1'>
                        <FormField
                            control={form.control}
                            name="logoFile"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Button asChild variant="outline" className='border-none bg-light text-primary shadow-xl'>
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
                         <p className='text-xs text-muted-foreground'>La imagen debe ser de 1080x1080px.</p>
                    </div>
                   </div>
                </div>

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-none bg-light text-primary shadow-xl">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Acepto los <Link href="/terms" className="text-primary hover:underline">términos y condiciones</Link> y las <Link href="/privacy" className="text-primary hover:underline">políticas de privacidad</Link>.*
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" className='mr-2'/> : <Building className="mr-2 h-4 w-4" />}
                  Registrar Club
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    