'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/user-context';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, User, UserCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import type { UserLike } from '@/contexts/user-context';
import { Label } from "@/components/ui/label";
import { useRRPP } from '@/contexts/rrpp-context';
import { useStores } from '@/contexts/stores-context';
import { toast } from 'sonner';

const rrppSchema = z.object({
  email: z.string().email('Email inválido.'),
});

type RrppFormData = z.infer<typeof rrppSchema>;

interface RrppAssociationModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  initialData?: UserLike | null;
}

export function RrppAssociationModal({ isOpen, onClose }: RrppAssociationModalProps) {
  const { getUserByEmail, actionLoading: contextLoading } = useUser();
  const { createRRPP, loading: rrppLoading } = useRRPP();
  const { selectedClub } = useStores();

  const [foundUser, setFoundUser] = useState<UserLike | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<RrppFormData>({
    resolver: zodResolver(rrppSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (isOpen) {
      setFoundUser(null);
      form.reset({ email: '' });
    }
  }, [isOpen, form]);

  const handleEmailBlur = async () => {
    const email = form.getValues('email');
    if (email) {
      setIsSearching(true);
      setFoundUser(null);
      const user = await getUserByEmail(email, false); 
      setIsSearching(false);
      if (user) {
        setFoundUser(user);
        form.clearErrors('email');
      } else {
        form.setError('email', { type: 'manual', message: 'No se encontró un usuario con ese email.' });
      }
    }
  };

  const onSubmit = async () => {
    if (!foundUser) return;

    const userId =
      (foundUser as any)?.id ??
      (foundUser as any)?._id ??
      (foundUser as any)?.uid;

    if (!userId) {
      toast.error('No se pudo determinar el ID del usuario.');
      return;
    }

    if (!selectedClub || selectedClub === 'all') {
      toast.error('Seleccioná un club antes de asociar un RRPP.');
      return;
    }

    const created = await createRRPP({ userId, stores: [selectedClub] });
    if (created) onClose(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className='bg-background border-none'>
        <DialogHeader>
          <DialogTitle>Asociar RRPP</DialogTitle>
          <DialogDescription>
            Busca un usuario por su email para asignarle el rol de RRPP.
          </DialogDescription>
        </DialogHeader>
        <Alert className='bg-secondary/40 border-none'>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Para poder asociar un RRPP, el usuario debe estar previamente registrado en la plataforma.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email del Usuario</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Buscar por email..."
                        onBlur={handleEmailBlur}
                        className="pl-9 bg-secondary/40 border-none"
                        disabled={contextLoading || rrppLoading}
                      />
                      {isSearching && <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {foundUser && (
              <div className="space-y-2">
                <Label>Usuario Encontrado</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    value={`${foundUser.name || ''} ${foundUser.lastName || ''}`.trim()}
                    disabled
                    className="pl-9 font-medium"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={contextLoading || rrppLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!foundUser || contextLoading || rrppLoading}>
                {(contextLoading || rrppLoading) && <Spinner size="sm" className="mr-2" />}
                Asociar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
