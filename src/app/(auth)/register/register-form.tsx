"use client";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/common/country-select";
import { useUser } from "@/contexts/user-context";
import { Eye, EyeOff, Info } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import modalFeedbackReact from "@/components/shared/feedback-modal";

// --- helpers ---
const sanitizeDoc = (v: string) =>
  String(v || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

// Regla idéntica al backend: DNI 6-12 dígitos o pasaporte 6-15 alfanumérico
const documentSchema = z
  .string()
  .min(6, "El DNI/ID debe tener al menos 6 caracteres.")
  .max(15, "El DNI/ID no puede tener más de 15 caracteres.")
  .regex(
    /^(?:\d{6,12}|[a-zA-Z0-9]{6,15})$/,
    "Documento inválido: usar 6-12 dígitos (DNI) o 6-15 alfanumérico (pasaporte)."
  );

const formSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es requerido."),
    lastName: z.string().min(1, "El apellido es requerido."),
    email: z
      .string()
      .email({ message: "Por favor, introduce un email válido." }),
    document: documentSchema,
    nationality: z.string().min(1, "La nacionalidad es requerida."),
    gender: z.enum(["M", "F", "Other"], {
      required_error: "El género es requerido.",
    }),
    age: z.coerce.number().min(1, "La edad es requerida."),
    alias: z
      .string()
      .min(1, "El alias es requerido.")
      .max(20, "El alias no puede tener más de 20 caracteres.")
      .regex(
        /^[a-zA-Z0-9.-]+$/,
        "El alias solo puede contener letras, números, puntos y guiones."
      ),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña."),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

const RegisterForm = () => {
  const { registerUser, actionLoading, checkAlias } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      document: "",
      nationality: "AR",
      age: undefined,
      alias: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onChange", // feedback más ágil en el campo documento
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Normalizo documento por las dudas antes de enviar
    const normalizedDoc = sanitizeDoc(values.document);

    const userData = {
      name: values.firstName,
      lastName: values.lastName,
      email: values.email.toLowerCase(),
      password: values.password,
      document: normalizedDoc,
      nationality: values.nationality,
      gender: values.gender,
      age: values.age,
      alias: `BasquetID.${values.alias}`,
    };
    await registerUser(userData);
  }

  const handleAliasBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const aliasValue = e.target.value;
    if (aliasValue) {
      const isAvailable = await checkAlias(`BasquetID.${aliasValue}`);
      if (!isAvailable) {
        modalFeedbackReact(
          "Este alias ya está en uso. Por favor, elige otro.",
          "",
          "warning",
          true
        );
        form.setError("alias", {
          type: "manual",
          message: "Este alias ya está en uso. Por favor, elige otro.",
        });
      } else {
        form.clearErrors("alias");
      }
    }
  };

  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm font-normal">
                    Correo electrónico
                  </FormLabel>
                  <FormControl className="border-none">
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Nombre</FormLabel>
                  <FormControl className="border-none">
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Apellido
                  </FormLabel>
                  <FormControl className="border-none">
                    <Input placeholder="Tu apellido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">DNI/ID</FormLabel>
                  <FormControl className="border-none">
                    <Input
                      placeholder="Tu DNI/ID"
                      {...field}
                      // Sanitizo en vivo: elimino no-alfanuméricos y paso a mayúsculas
                      onChange={(e) => {
                        const clean = sanitizeDoc(e.target.value);
                        field.onChange(clean);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">
                    Nacionalidad
                  </FormLabel>
                  <FormControl className="border-none">
                    <CountrySelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Género</FormLabel>
                  <FormControl className="border-none">
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4 pt-2"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl className="border-none">
                          <RadioGroupItem value="M" />
                        </FormControl>
                        <FormLabel className="font-normal">Masculino</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl className="border-none">
                          <RadioGroupItem value="F" />
                        </FormControl>
                        <FormLabel className="font-normal">Femenino</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl className="border-none">
                          <RadioGroupItem value="Other" />
                        </FormControl>
                        <FormLabel className="font-normal">Otro</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">Edad</FormLabel>
                  <FormControl className="border-none">
                    <Input type="number" placeholder="Tu edad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-sm font-normal">Alias</FormLabel>
                  <div className="relative">
                    <FormControl className="border-none">
                      <Input
                        placeholder="Tu alias"
                        {...field}
                        className="pl-24"
                        maxLength={20}
                        onBlur={handleAliasBlur}
                      />
                    </FormControl>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      BasquetID.
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Este alias es tu identificador único en la
                            aplicación.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormLabel className="text-sm font-normal">
                    Confirmar Contraseña
                  </FormLabel>
                  <FormControl className="border-none">
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl className="border-none bg-secondary">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-muted-foreground">
                  Acepto los{" "}
                  <Link href="#" className="text-primary hover:underline">
                    términos y condiciones.
                  </Link>
                </FormLabel>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full text-lg bg-light shadow-md"
            disabled={actionLoading || !form.watch("acceptTerms")}
          >
            {actionLoading && <Spinner size="sm" className="mr-2" />}
            Registrarme Gratis
          </Button>
        </form>
      </Form>
    </CardContent>
  );
};

export default RegisterForm;
