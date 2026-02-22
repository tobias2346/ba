'use client'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUser } from '@/contexts/user-context'
import { useToast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'
import { Eye, EyeOff } from 'lucide-react'

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

const ChangePassword = () => {

  const { changeUserPassword, actionLoading } = useUser();
  const [showPassword, setShowPassword] = useState(false)

  const { toast } = useToast();

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    const success = await changeUserPassword(values.newPassword);
    if (success) {
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada con éxito." });
      passwordForm.reset();
    }
  }

  return (
    <Form {...passwordForm}>
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 mb-4">
        <FormField
          control={passwordForm.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    className="px-2 py-5 border-slate-800 border-2 md:border-none" // espacio para el botón
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
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
        <FormField
          control={passwordForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-semibold'>Confirmar contraseña</FormLabel>
              <FormControl><Input type="password" className=' px-2 py-5 border-slate-800 border-2 md:border-none ' placeholder='••••••••' {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit" className="w-full px-4 py-2.5 font-semibold rounded-lg shadow transition-colors duration-200 text-base bg-primary text-black hover:bg-primary/80 mt-2" disabled={actionLoading}>
          {actionLoading && <Spinner size="sm" className="mr-2" />}
          Cambiar Contraseña
        </button>
      </form>
    </Form>
  )
}

export default ChangePassword