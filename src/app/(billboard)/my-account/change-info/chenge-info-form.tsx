'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useUser } from '@/contexts/user-context'
import { Copy, Check, UserCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import CommonButton from '@/components/common/common-button'

const profileFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  lastName: z.string().min(1, 'El apellido es requerido.'),
  document: z.string().min(1, 'El DNI/ID es requerido.'),
  phone: z.string().optional(),
  age: z.coerce.number().min(1, 'La edad es requerida.'),
  gender: z.enum(['M', 'F', 'Other'], { required_error: 'El género es requerido.' }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
})

const ChangeInfoForm = () => {
  const { user, updateUser, changeUserPhoto, actionLoading } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      lastName: '',
      document: '',
      phone: '',
      age: 0,
      gender: undefined,
      email: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name as string || '',
        lastName: user.lastName as string || '',
        document: user.document as string || '',
        phone: user.phone as string || '',
        age: user.age as number || 0,
        gender: user.gender as 'M' | 'F' | 'Other' || undefined,
        email: user.email as string || '',
      });
    }
  }, [user, profileForm]);

  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    updateUser(values);
  }

  const handlePhotoUpdateClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      await changeUserPhoto(formData);
    }
  };

  const copyAliasToClipboard = () => {
    const alias = user?.alias as string || '';
    navigator.clipboard.writeText(alias);
    setCopied(true);
    toast({ title: "Alias copiado", description: "Tu alias ha sido copiado al portapapeles." });
    setTimeout(() => setCopied(false), 2000);
  };

  const { isDirty } = profileForm.formState;

  return (
    <div className="w-full md:max-w-lg mx-auto space-y-8">
      <Card className="bg-transparent border-none md:bg-dark p-0">
        <CardHeader className="w-full flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={user?.photo as string} alt={user?.name as string} />
            <AvatarFallback className="bg-background">
              <UserCircle className="h-full w-full text-primary" />
            </AvatarFallback>
          </Avatar>
          <CommonButton type='ghost' text='Actualizar foto de perfil' action={handlePhotoUpdateClick} disabled={actionLoading} />
          <input type="file" ref={fileInputRef} onChange={handlePhotoSubmit} className="hidden" accept="image/*" />
        </CardHeader>
        <CardContent className="p-0 md:p-4 space-y-6">
          <div className="text-center space-y-2">
            <Label>Tu Alias</Label>
            <div className="flex items-center justify-center gap-2 bg-slate-800 p-2 rounded-md">
              <p className="font-mono text-primary">{user?.alias as string || 'BasquetID.example'}</p>
              <Button variant="ghost" size="icon" onClick={copyAliasToClipboard} className="h-7 w-7">
                {copied ? <Check className="text-green-500" /> : <Copy />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Este es tu identificador único en la aplicación.</p>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <CardTitle className="text-lg border-b pb-2">Datos Personales</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl><Input className='border-none bg-slate-800' {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl><Input className='border-none bg-slate-800' {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI/ID</FormLabel>
                      <FormControl><Input className='border-none bg-slate-800' {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl><Input className='border-none bg-slate-800' type="tel" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edad</FormLabel>
                      <FormControl><Input className='border-none bg-slate-800' type="number" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="M" /></FormControl>
                          <FormLabel className="font-normal">M</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="F" /></FormControl>
                          <FormLabel className="font-normal">F</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Other" /></FormControl>
                          <FormLabel className="font-normal">Otro</FormLabel>
                        </FormItem>
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl><Input className='border-none bg-slate-800' type="email" {...field} disabled value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-dark hover:text-light" disabled={!isDirty || actionLoading}>
                {actionLoading && <Spinner size="sm" className="mr-2" />}
                Guardar Cambios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangeInfoForm;
