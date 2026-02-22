"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/contexts/user-context";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CountrySelect } from "@/components/common/country-select";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import CommonModal from "../common/common-modal";
import CommonButton from "../common/common-button";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  document: z.string().min(1, "El DNI/ID es requerido."),
  nationality: z.string().min(1, "La nacionalidad es requerida."),
  gender: z.enum(["M", "F", "Other"], {
    required_error: "El género es requerido.",
  }),
  age: z.coerce.number().min(1, "La edad es requerida."),
  alias: z
    .string()
    .min(1, "El alias es requerido.")
    .max(20, "El alias no puede tener más de 20 caracteres.")
    .regex(/^[a-zA-Z0-9.-]+$/, "El alias solo puede contener letras, números, puntos y guiones."),
});

export function CompleteProfileModal({ open, closeFunct }) {

  const { user, updateUser, actionLoading, checkAlias } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      document: "",
      nationality: "AR",
      gender: "Other",
      age: undefined,
      alias: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const prefixed = values.alias.startsWith("BasquetID.")
      ? values.alias
      : `BasquetID.${values.alias}`;
    const userData = { ...values, alias: prefixed, completed: true };
    await updateUser(userData);
    // En UserProvider.updateUser se cierra el modal y redirige si corresponde
  };

  const handleAliasBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const aliasValue = e.target.value?.trim();
    if (!aliasValue) return;
    const candidate = aliasValue.startsWith("BasquetID.")
      ? aliasValue
      : `BasquetID.${aliasValue}`;
    if (candidate !== (user?.alias || "")) {
      const isAvailable = await checkAlias(candidate);
      if (!isAvailable) {
        form.setError("alias", {
          type: "manual",
          message: "Este alias ya está en uso. Por favor, elige otro.",
        });
      } else {
        form.clearErrors("alias");
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    form.reset({
      name: (user.name as string) || "",
      lastName: (user.lastName as string) || "",
      document: "",
      nationality: (user.nationality as string) || "AR",
      gender: (user.gender as "M" | "F" | "Other") || "Other",
      age: (user.age as number) || undefined,
      alias: ("").replace("BasquetID.", ""),
    });

  }, [user, form, closeFunct]);

  return (
    <CommonModal open={open} setOpen={closeFunct}>
      <header>
        <h3 className="text-2xl font-semibold mb-3">Completa tu Perfil</h3>
        <p className=" text-sm md:text-base">
          Necesitamos algunos datos más para finalizar la configuración de tu
          cuenta.
        </p>
      </header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-3 md:gap-4 flex-wrap justify-between items-center">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-[45%] ">
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
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
                <FormItem className="w-[45%] ">
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
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
                <FormItem className="w-[45%] ">
                  <FormLabel>DNI/ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu DNI/ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem className="w-[45%]">
                  <FormLabel>Edad</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Tu edad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem className="w-full md:w-[45%] ">
                  <FormLabel>Nacionalidad</FormLabel>
                  <FormControl>
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
                <FormItem className="w-full">
                  <FormLabel>Género</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex items-center space-x-4 pt-2"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="M" />
                        </FormControl>
                        <FormLabel className="font-normal">Masculino</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="F" />
                        </FormControl>
                        <FormLabel className="font-normal">Femenino</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
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
              name="alias"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Alias</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                      translate="no"
                        placeholder="Tu alias"
                        {...field}
                        className="pl-24"
                        maxLength={20}
                        onBlur={handleAliasBlur}
                      />
                    </FormControl>
                    <span translate="no" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      BasquetID.
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <footer className="flex justify-between w-full">
            <CommonButton
              text="Cancelar"
              type="secondary"
              action={closeFunct}
              disabled={actionLoading}
            />
            <Button
              className="px-4 py-2 font-medium rounded-lg shadow transition-colors duration-200 text-sm xl:text-base bg-primary text-black hover:bg-primary/80"
              type="submit"
              disabled={actionLoading}
            >
              {actionLoading && <Spinner size="sm" className="mr-2" />}
              Guardar y continuar
            </Button>
          </footer>
        </form>
      </Form>
    </CommonModal>
  );
}
