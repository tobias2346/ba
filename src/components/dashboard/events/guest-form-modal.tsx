"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useLists } from "@/contexts/lists-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { se } from "date-fns/locale";

const guestSchema = z.object({
  type: z.enum(["alias", "email"]),
  value: z.string().min(1, "El valor es requerido"),
  isManager: z.boolean(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestFormModalProps {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  eventId: string;
  eventData: any;
  sectors?: any[];
}

export function GuestFormModal({
  isOpen,
  onClose,
  currentListId,
  eventId,
  eventData,
  fetchData,
}: GuestFormModalProps) {
  const { addGuest, loading } = useLists();
  const isNumerated = eventData?.type === "numerated";
  const { listId, sectors } = currentListId;
  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      type: "alias",
      value: "",
      isManager: false,
    },
  });

  const [currentTab, setCurrentTab] = useState("alias");
  const [selectedRow, setSelectedRow] = useState("");
  const [selectedSeat, setSelectedSeat] = useState("");
  // Filas únicas
  const rows = [...new Set(sectors.seats.map((seat) => seat.rowLabel))];

  // Filtrar butacas según fila
  const filteredSeats = sectors.seats.filter(
    (seat) => seat.rowLabel === selectedRow
  );

  useEffect(() => {
    form.reset();
  }, [isOpen, form]);

  const onSubmit = async (data: GuestFormData) => {
    let payload;
    let queryParams: any = { eventId };

    if (data.type === "alias") {
      payload = { alias: data.value, eventId };
      if (data.isManager) queryParams.manager = true;
    } else {
      payload = { email: data.value, eventId };
      queryParams.email = true;
    }

    if (isNumerated && selectedSeat) {
      payload.seatCode = selectedSeat;
    }

    const success = await addGuest(listId, payload, queryParams);
    if (success) {
      onClose(true);
      fetchData();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Invitado</DialogTitle>
          <DialogDescription>
            Agrega un invitado a la lista por su alias o email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <Tabs
            defaultValue="alias"
            value={currentTab}
            onValueChange={(value) => {
              setCurrentTab(value);
              form.setValue("type", value as "alias" | "email");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="alias"
                className="data-[state=active]:bg-primary rounded"
              >
                Por Alias
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="data-[state=active]:bg-primary rounded"
              >
                Por Email
              </TabsTrigger>
            </TabsList>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              {/* === Por Alias === */}
              <TabsContent value="alias" className="m-0 space-y-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias del usuario</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: BasquetID.juanperez"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ✅ Mostrar select de fila y butaca si el evento es numerado */}
                {isNumerated && sectors.numerated && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Select de fila */}
                    <FormItem>
                      <FormLabel>Fila</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            setSelectedRow(value);
                            setSelectedSeat("");
                          }}
                          value={selectedRow}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona fila" />
                          </SelectTrigger>
                          <SelectContent>
                            {rows.map((row) => (
                              <SelectItem key={row} value={row}>
                                {row}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    {/* Select de butaca */}
                    <FormItem>
                      <FormLabel>Butaca</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={setSelectedSeat}
                          value={selectedSeat}
                          disabled={!selectedRow}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona butaca" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSeats.map((seat) => (
                              <SelectItem key={seat.code} value={seat.code}>
                                {seat.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  </div>
                )}

                {/* Campo de gestor (solo si NO es numerado) */}
                {!sectors.numerated && (
                  <FormField
                    control={form.control}
                    name="isManager"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Asignar como gestor</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            El usuario podrá gestionar esta lista.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              {/* === Por Email === */}
              <TabsContent value="email" className="m-0 space-y-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email del invitado</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="invitado@ejemplo.com"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* ✅ Mostrar select de fila y butaca si el evento es numerado */}
                {isNumerated && sectors.numerated && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Select de fila */}
                    <FormItem>
                      <FormLabel>Fila</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            setSelectedRow(value);
                            setSelectedSeat("");
                          }}
                          value={selectedRow}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona fila" />
                          </SelectTrigger>
                          <SelectContent>
                            {rows.map((row) => (
                              <SelectItem key={row} value={row}>
                                {row}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    {/* Select de butaca */}
                    <FormItem>
                      <FormLabel>Butaca</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={setSelectedSeat}
                          value={selectedSeat}
                          disabled={!selectedRow}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona butaca" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSeats.map((seat) => (
                              <SelectItem key={seat.code} value={seat.code}>
                                {seat.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  </div>
                )}
              </TabsContent>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Spinner size="sm" className="mr-2" />}
                  Agregar Invitado
                </Button>
              </DialogFooter>
            </form>
          </Tabs>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
