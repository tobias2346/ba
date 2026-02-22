"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { API_BASE_URL, credentialsOption } from "@/services/enviroment";
import { toast } from "sonner";
import StepOne from "./step-one";
import StepTwo from "./step-two";
import { options, ModalState } from "./options";
import { useRouter } from "next/navigation";
import { useMyTicketContext } from "../../../context/my-ticketsContext";

interface ModalSelectorProps {
  modal: ModalState;
  setModal: React.Dispatch<React.SetStateAction<ModalState>>;
  accessId: string;
}

const ModalSelector = ({ modal, setModal, accessId }: ModalSelectorProps) => {
  const [alias, setAlias] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const router = useRouter();
  const current = modal.type ? options[modal.type] : null;
  const [user, setUser] = useState(null);
  const { selectedTickets } = useMyTicketContext();

  const handleClose = () => {
    setModal({ open: false, type: "" });
    setStep(1);
    setAlias("");
  };

  const handleBack = () => {
    step === 2 ? setStep(1) : handleClose();
  };

  const handleAssign = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/accesses/assign`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          alias: `${alias}`,
          accessId: selectedTickets[0],
        }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        toast.error(message || "No se pudo asignar el evento.");
        return;
      }
      toast.success("Ticket asignado");
      router.back();
    } catch (error) {
      toast.error("Error inesperado al asignar el ticket.");
      console.error(error);
    }
  };

  const handleTransfer = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/accesses/transfer`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          alias: `${alias}`,
          accessIds: selectedTickets,
        }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        toast.error(message || "No se pudo transferir el evento.");
        return;
      }
      toast.success("Ticket transferido");
      router.back();
    } catch (error) {
      toast.error("Error inesperado al transferir el ticket.");
      console.error(error);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const res = await fetch(`${API_BASE_URL}/users/alias/${alias}`, {
        method: "GET",
        credentials: credentialsOption,
      });
      if (!res.ok) {
        toast.error("El alias ingresado es incorrecto");
        return;
      }
      const data = await res.json();
      setUser(data);
      setStep(2);
      return;
    }
    if (modal.type === "assign") await handleAssign();
    if (modal.type === "transfer") await handleTransfer();
  };

  const steps: Record<number, JSX.Element> = {
    1: <StepOne setAlias={setAlias} alias={alias} />,
    2: <StepTwo type={modal.type} accessId={accessId} newUser={user} />,
  };

  return (
    <Dialog open={modal.open} onOpenChange={handleClose}>
      <DialogTitle className="hidden" />
      <DialogContent className="max-w-xs sm:max-w-sm px-8 py-10 rounded-lg border-none bg-dark">
        {current && (
          <form
            onSubmit={onSubmit}
            className="w-full flex flex-col items-center gap-5"
          >
            {/* Título */}
            <h2 className="text-lg font-headline font-semibold">
              {current.title}
            </h2>

            {/* Descripción */}
            <p className="text-sm text-center text-slate-300">
              {current.description}
            </p>

            {/* Step */}
            {steps[step]}

            {/* Botones */}
            <ModalActions step={step} alias={alias} onBack={handleBack} />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalSelector;

// 👉 Subcomponente
const ModalActions = ({
  step,
  alias,
  onBack,
}: {
  step: number;
  alias: string;
  onBack: () => void;
}) => (
  <div className="flex justify-between w-full gap-4 mt-2">
    <button
      type="button"
      onClick={onBack}
      className="w-1/2 py-2.5 rounded-md border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
    >
      {step === 1 ? "Cancelar" : "Volver"}
    </button>
    <button
      type="submit"
      className={`w-1/2 py-2.5 rounded-md bg-primary text-black font-semibold hover:bg-primary/80 transition-colors ${
        alias === "" && "cursor-not-allowed opacity-50"
      }`}
      disabled={alias === ""}
    >
      {step === 1 ? "Siguiente" : "Confirmar"}
    </button>
  </div>
);
