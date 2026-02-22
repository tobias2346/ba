
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEvents } from '@/contexts/events-context';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Upload } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';


type VerifyFormData = z.infer<ReturnType<typeof createVerifySchema>>;

interface VerifyEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VerifyFormData) => void;
  initialData?: {
    id: string;
    verified: boolean;
    onHome: boolean;
    carouselId: string | null;
    trending: boolean;
    banner?: string;
  } | null;
}

const createVerifySchema = (initialData?: VerifyEventModalProps['initialData']) => z.object({
  verified: z.boolean(),
  onHome: z.boolean(),
  carouselId: z.string().nullable(),
  trending: z.boolean(),
  banner: z.any().optional(),
}).refine(data => !data.verified || (data.verified && data.carouselId), {
  message: 'El carrusel es requerido si el evento está verificado.',
  path: ['carouselId'],
}).refine(data => !data.trending || (data.trending && (data.banner || initialData?.banner)), {
  message: 'El banner es requerido si el evento es trending.',
  path: ['banner'],
});


export function VerifyEventModal({ isOpen, onClose, onSave, initialData }: VerifyEventModalProps) {
  const { listCarousels, loading: eventsLoading } = useEvents();
  const [carousels, setCarousels] = useState<any[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const verifySchema = useMemo(() => createVerifySchema(initialData), [initialData]);

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      verified: false,
      onHome: true,
      carouselId: null,
      trending: false,
      banner: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchCarousels = async () => {
        const data = await listCarousels();
        setCarousels(data);
      }
      fetchCarousels();

      if (initialData) {
        form.reset({
          verified: initialData.verified,
          onHome: initialData.onHome,
          carouselId: initialData.carouselId,
          trending: initialData.trending,
          banner: null,
        });
        setBannerPreview(initialData.banner || null);
      }
    }
  }, [isOpen, initialData, form, listCarousels]);

  const isTrending = form.watch('trending');

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const isValid = await validateBannerDimensions(file);
      if (isValid) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        form.setValue('banner', file, { shouldDirty: true, shouldValidate: true });
      } else {
        e.target.value = '';
        form.setValue('banner', null, { shouldDirty: true, shouldValidate: true });
        setBannerPreview(initialData?.banner || null);
      }
    }
  };

  const validateBannerDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        form.setError("banner", { message: "El archivo no es una imagen válida." });
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new window.Image();
        image.src = e.target?.result as string;
        image.onload = () => {
          const aspectRatio = image.width / image.height;
          const targetAspectRatio = 900 / 500;

          if (Math.abs(aspectRatio - targetAspectRatio) < 0.01) {
            form.clearErrors("banner");
            resolve(true);
          } else {
            form.setError("banner", { message: "La imagen debe tener una relación de aspecto de 9:5 (Ej: 900x500)." });
            resolve(false);
          }
        };
        image.onerror = () => {
          form.setError("banner", { message: "No se pudo cargar la imagen para validarla." });
          resolve(false);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = (data: VerifyFormData) => {
    const finalData = { ...data };
    if (!finalData.banner && initialData?.banner) {
      finalData.banner = initialData.banner;
    }
    console.log(finalData)
    onSave(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Verificar Evento</DialogTitle>
          <DialogDescription>
            Configura la visibilidad y promoción del evento en la plataforma.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Verificado</FormLabel>
                    <p className='text-xs text-muted-foreground'>Confirma que el evento es oficial.</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="onHome"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Mostrar en Home</FormLabel>
                    <p className='text-xs text-muted-foreground'>Define si el evento aparece en la página principal.</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carouselId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrusel</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar un carrusel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Ninguno</SelectItem>
                      {carousels.map(carousel => (
                        <SelectItem key={carousel.id} value={carousel.id}>{carousel.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trending"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Trending</FormLabel>
                    <p className='text-xs text-muted-foreground'>Destaca el evento con un banner especial.</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isTrending && (
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="banner"
                  render={() => (
                    <FormItem>
                      <FormLabel>Banner del Evento</FormLabel>
                      <div className='flex flex-col items-center gap-4'>

                        <div className='flex flex-col gap-1'>
                          <FormControl>
                            <Button asChild variant="outline">
                              <label htmlFor="banner-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Seleccionar Banner
                                <input id="banner-upload" type="file" className="hidden" onChange={handleBannerChange} accept="image/*" />
                              </label>
                            </Button>
                          </FormControl>
                          <p className='text-xs text-muted-foreground'>Relación de aspecto 9:5 (Ej: 900x500).</p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {bannerPreview ? (

                  <div className='sapce-y-2 my-4 '>
                    <Image src={bannerPreview} alt="Vista previa del banner" width={500} height={500} className="rounded-md object-contain bg-muted aspect-video h-28" />
                  </div>

                ) : (
                  <div className="w-20 h-12 bg-muted rounded-md flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={eventsLoading}>Cancelar</Button>
              <Button type="submit" disabled={eventsLoading}>
                {eventsLoading && <Spinner size='sm' className='mr-2' />}
                Verificar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
