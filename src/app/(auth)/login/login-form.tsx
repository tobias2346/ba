'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/contexts/user-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { useState } from "react";
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
  remember: z.boolean().optional(),
});

const LoginForm = () => {
  const { loginUser, loginWithGoogle, actionLoading } = useUser();
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await loginUser({ email: values.email.toLowerCase(), password: values.password }, "user");
    } catch (e) {
    }
  }

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-headline">Correo electrónico</Label>
                  <FormControl className="border-none">
                    <Input placeholder="usuario@email.com" {...field} />
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
                  <FormLabel className="text-sm font-headline">Contraseña</FormLabel>
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
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label>Recordarme</Label>
                    </div>
                  </FormItem>
                )}
              />

            </div>

            <Button type="submit" className="w-full bg-primary text-dark hover:text-light" disabled={actionLoading}>
              {actionLoading && <Spinner size="sm" className="mr-2" />}
              Iniciar sesión
            </Button>
            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-primary font-semibold text-sm hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dark px-2 text-muted-foreground">O</span>
          </div>
        </div>

        <button type="button" className="w-full bg-light flex justify-center items-center rounded-lg py-2 gap-x-4 text-dark transition-all duration-300 hover:bg-primary " onClick={handleGoogleLogin}>
          <Image src='/brands/google.svg' height={30} width={30} alt="goolge icon" />
          <span className="font-semibold text-sm">Continua con Google</span>
        </button>

        <div className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            REGISTRATE GRATIS
          </Link>
        </div>
      </CardContent>
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </>
  )
}

export default LoginForm
