
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { ImageIcon, Trash2, Upload } from 'lucide-react';
import { useStores } from '@/contexts/stores-context';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  logoFile: z.any().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { id: string; name: string; logo: string } | null;
}

export function CategoryFormModal({ isOpen, onClose, initialData }: CategoryFormModalProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { createCategory, updateCategory, deleteCategory, loading } = useStores();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', logoFile: null },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({ name: initialData.name, logoFile: null });
        setLogoPreview(initialData.logo || null);
      } else {
        form.reset({ name: '', logoFile: null });
        setLogoPreview(null);
      }
    }
  }, [initialData, form, isOpen]);


  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        form.setValue('logoFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    let success;
    if (isEditing) {
        success = await updateCategory(initialData.id, data.name, data.logoFile);
    } else {
        success = await createCategory(data.name, data.logoFile);
    }
    if (success) {
      onClose();
    }
  };
  
  const handleDelete = async () => {
      if(initialData?.id){
          const success = await deleteCategory(initialData.id);
          if (success) {
            onClose();
          }
      }
  }

  const isEditing = !!initialData;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Categoría</DialogTitle>
           <DialogDescription>
            {isEditing ? 'Modifica el nombre o el logo de la categoría.' : 'Añade una nueva categoría para organizar tus clubes.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Categoría</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Liga Nacional"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
                <FormLabel>Logo</FormLabel>
                <div className="flex items-center gap-4">
                    {logoPreview ? (
                        <NextImage src={logoPreview} alt="Vista previa del logo" width={64} height={64} className="rounded-md bg-muted object-contain aspect-square" />
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
                                        <label htmlFor="logo-upload-cat" className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Subir Logo
                                            <input id="logo-upload-cat" type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
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

            <DialogFooter className='pt-4'>
                <div className='flex justify-between w-full'>
                    <div>
                        {isEditing && (
                            <Button type="button" variant="destructive" onClick={() => setIsAlertOpen(true)} disabled={loading}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Eliminar
                            </Button>
                        )}
                    </div>
                    <div className='flex gap-2'>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner size='sm' className='mr-2'/>}
                            Guardar
                        </Button>
                    </div>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la categoría.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className='bg-destructive hover:bg-destructive/80'>
                {loading && <Spinner size='sm' className='mr-2' />}
                Eliminar
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
