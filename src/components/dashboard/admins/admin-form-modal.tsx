
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/user-context';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, User, UserCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { MultiSelect } from './multi-select-clubs';
import type { UserLike } from '@/contexts/user-context';
import { useStores } from '@/contexts/stores-context';

const adminSchema = z.object({
  email: z.string().email('Email inválido.'),
  name: z.string().optional(),
  role: z.string().min(1, 'El rol es requerido.'),
  stores: z.array(z.string()),
}).superRefine((data, ctx) => {
    if (data.role !== 'admin' && data.stores.length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['stores'],
            message: 'Debes seleccionar al menos un club para este rol.',
        });
    }
});


type AdminFormData = z.infer<typeof adminSchema>;

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UserLike | null;
}

const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'rrpp-leader', label: 'RRPP Leader' },
    { value: 'data-analyst', label: 'Data Analyst' },
];


export function AdminFormModal({ isOpen, onClose, initialData }: AdminFormModalProps) {
  const { getUserByEmail, changeUserRole, actionLoading: contextLoading } = useUser();
  const { stores, getStores } = useStores();
  const [foundUser, setFoundUser] = useState<UserLike | null>(initialData || null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: { email: '', name: '', role: '', stores: [] },
  });
  
  const selectedRole = form.watch('role');

  useEffect(() => {
    if(isOpen) {
      getStores({ enabled: true });
    }
  }, [isOpen, getStores]);


  useEffect(() => {
    if (initialData) {
      setFoundUser(initialData);
      form.reset({
        email: initialData.email || '',
        name: `${initialData.name || ''} ${initialData.lastName || ''}`.trim(),
        role: initialData.role || '',
        stores: (initialData.stores as any[])?.map(club => {
          // It can be an object {id, name} or just a string with the name
          if (typeof club === 'object' && club !== null && club.id) {
            return club.id.toString();
          }
          // For now, if it's a string, we can't map to an ID here without the full list.
          // This part of the logic assumes that `initialData.stores` contains objects with IDs.
          // If it can contain only names, this mapping will fail for those cases.
          return null;
        }).filter(Boolean) as string[] || [],
      });
    } else {
      setFoundUser(null);
      form.reset({ email: '', name: '', role: '', stores: [] });
    }
  }, [initialData, form, isOpen]);


  const handleEmailBlur = async () => {
    const email = form.getValues('email');
    if (email && email !== initialData?.email) {
      setIsSearching(true);
      setFoundUser(null);
      form.resetField('name');
      form.resetField('role');
      form.resetField('stores');
      const user = await getUserByEmail(email, true);
      setIsSearching(false);
      if (user) {
        setFoundUser(user);
        form.setValue('name', `${user.name || ''} ${user.lastName || ''}`.trim());
        if (user.role && roles.some(r => r.value === user.role)) {
          form.setValue('role', user.role || '');
        }
        
        const storeIds = (user.stores as any[])?.map(club => {
          if (typeof club === 'object' && club !== null && club.id) {
            return club.id.toString();
          }
          return null; // Ignore if not an object with id
        }).filter(Boolean) as string[] || [];
        form.setValue('stores', storeIds);

        form.clearErrors('email');
      } else {
        form.setError('email', { type: 'manual', message: 'No existe un usuario con ese email o no tiene permisos para ser admin.' });
      }
    }
  };

  const onSubmit = async (data: AdminFormData) => {
    if (foundUser) {
        const payloadStores = data.role === 'admin' ? [] : data.stores;
        const success = await changeUserRole(foundUser, data.role, payloadStores);
        if(success) onClose();
    }
  };
  
  const clubOptions = stores.map(store => ({ value: store.id, label: store.name }));

  const isEditing = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-background border-none'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Crear'} Administrador</DialogTitle>
           <DialogDescription>
            {isEditing ? 'Modifica los permisos y clubes del administrador.' : 'Busca un usuario por su email para asignarle un rol de administrador.'}
          </DialogDescription>
        </DialogHeader>
         <Alert className='bg-secondary/40 border-none'>
            <Info className="h-4 w-4" />
            <AlertDescription>
                Para poder asignar un administrador, el usuario debe estar previamente registrado en la plataforma.
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
                            disabled={isEditing || contextLoading}
                            
                        />
                         {isSearching && <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {foundUser && (
                <>
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                             <div className="relative">
                                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary bg-secondary/40 border-none" />
                                <Input {...field} disabled className="pl-9 font-medium"/>
                             </div>
                        </FormControl>
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="role"
                    
                    render={({ field }) => (
                        <FormItem >
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar un rol" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className='bg-secondary border-none'>
                                {roles.map(role => (
                                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {selectedRole && selectedRole !== 'admin' && (
                    <FormField
                        control={form.control}
                        name="stores"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Clubes Asociados</FormLabel>
                                <MultiSelect 
                                    options={clubOptions}
                                    selected={field.value}
                                    onChange={field.onChange}
                                    placeholder='Seleccionar clubes...'
                                />
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                </>
            )}
           
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={contextLoading}>Cancelar</Button>
              <Button type="submit" disabled={!foundUser || contextLoading}>
                {contextLoading && <Spinner size="sm" className="mr-2" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
