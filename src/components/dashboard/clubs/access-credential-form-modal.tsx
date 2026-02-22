
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const credentialSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

type CredentialFormData = z.infer<typeof credentialSchema>;

interface AccessCredentialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CredentialFormData) => void;
  initialData?: Partial<CredentialFormData>;
}

export function AccessCredentialFormModal({ isOpen, onClose, onSave, initialData }: AccessCredentialFormModalProps) {
  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: initialData || { username: '', password: '' },
  });
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = (data: CredentialFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar' : 'Crear'} Credencial de Acceso</DialogTitle>
          <DialogDescription>
            Las credenciales se usarán para iniciar sesión en la App de Control de Acceso.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: acceso_puerta_1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10 border-none" // espacio para el botón
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
