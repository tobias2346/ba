
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { useStores } from '@/contexts/stores-context';
import { Spinner } from '@/components/ui/spinner';

// Stripe Schema and Modal
const stripeSchema = z.object({
  publicKey: z.string().min(1, 'La Public Key es requerida.'),
  secretKey: z.string().min(1, 'La Secret Key es requerida.'),
});

type StripeFormData = z.infer<typeof stripeSchema>;

interface StripeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StripeFormData) => void;
  initialData?: StripeFormData;
}

export function StripeConfigModal({ isOpen, onClose, onSave, initialData }: StripeConfigModalProps) {
  const { loading } = useStores();
  const form = useForm<StripeFormData>({
    resolver: zodResolver(stripeSchema),
    defaultValues: { publicKey: '', secretKey: '' },
  });

  useEffect(() => {
    if(initialData) {
      form.reset(initialData)
    }
  }, [initialData, form]);

  const onSubmit = (data: StripeFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Stripe</DialogTitle>
          <DialogDescription>Ingresa tus credenciales de API de Stripe.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="publicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size='sm' className='mr-2' />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Mercado Pago Schema and Modal
const mercadoPagoSchema = z.object({
  publicKey: z.string().min(1, 'La Public Key es requerida.'),
  accessToken: z.string().min(1, 'El Access Token es requerido.'),
  userId: z.string().min(1, 'El User ID es requerido.'),
});

type MercadoPagoFormData = z.infer<typeof mercadoPagoSchema>;

interface MercadoPagoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MercadoPagoFormData) => void;
  initialData?: MercadoPagoFormData;
}

export function MercadoPagoConfigModal({ isOpen, onClose, onSave, initialData }: MercadoPagoConfigModalProps) {
  const { loading } = useStores();
  const form = useForm<MercadoPagoFormData>({
    resolver: zodResolver(mercadoPagoSchema),
    defaultValues: { publicKey: '', accessToken: '', userId: '' },
  });

  useEffect(() => {
    if(initialData) {
      form.reset(initialData)
    }
  }, [initialData, form]);

  const onSubmit = (data: MercadoPagoFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Mercado Pago</DialogTitle>
          <DialogDescription>Ingresa tus credenciales de API de Mercado Pago.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="publicKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID (Collector ID)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                 {loading && <Spinner size='sm' className='mr-2' />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
