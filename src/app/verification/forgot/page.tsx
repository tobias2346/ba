"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

function ForgotPasswordForm() {
  const { actionLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const changePasswordWithToken = async (pass: string, tok: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_ENTORNO !== "develop"
            ? process.env.NEXT_PUBLIC_API_URL
            : process.env.NEXT_PUBLIC_API_DEV_URL
        }/users/recover`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-type": "application/json;charset=UTF-8" },
          body: JSON.stringify({ password: pass, token: tok }),
        }
      );

      if (response.ok) {
        toast.success("Tu contraseña ha sido cambiada con éxito.");
        // Damos un pequeño tiempo para que el usuario vea el toast
        setTimeout(() => {
          router.push("/");
        }, 1600);
      } else {
        const msg = await safeParseError(response);
        toast.error(msg);
      }
    } catch (error) {
      toast.error("Error de red");
      console.error(error);
    }
  };

  async function safeParseError(res: Response) {
    try {
      const data = await res.json();
      if (typeof data === "string") return data;
      if (data?.message) return String(data.message);
      return "Ocurrió un error inesperado.";
    } catch {
      return "Ocurrió un error inesperado.";
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.warning("Token inválido o faltante");
      return;
    }
    await changePasswordWithToken(values.password, token);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-dark/80 border-none">
      <CardHeader className="items-center text-center">
        <KeyRound className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="text-2xl font-headline">
          Restablecer Contraseña
        </CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="pr-10 border-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={showPassword ? "Ocultar" : "Mostrar"}
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
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={!token || actionLoading || form.formState.isSubmitting}
            >
              {(actionLoading || form.formState.isSubmitting) && (
                <Spinner size="sm" className="mr-2" />
              )}
              Confirmar Contraseña
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Spinner size="lg" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
