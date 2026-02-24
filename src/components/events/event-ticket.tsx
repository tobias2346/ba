"use client";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Checkout,
  useEventContext,
} from "@/app/(billboard)/events/[id]/context/eventContext";
import modalFeedbackReact from "../shared/feedback-modal";
import { useAccesses } from "@/contexts/accesses-context";
import { useEffect, useMemo } from "react";

const EventTicket = ({ ticket }: { ticket: Checkout }) => {
  const { setCheckout, checkout, event } = useEventContext();

  // === Nuevo: traemos el resumen de accesos del usuario por evento
  const { mySummary, getMyAccessSummary } = useAccesses();

  useEffect(() => {
    if (event?.id) getMyAccessSummary(event.id);
  }, [event?.id, getMyAccessSummary]);

  // userOwned ahora se calcula comparando ticket.id contra catalogItemId del resumen
  const userOwned = useMemo(() => {
    if (!ticket?.id || !Array.isArray(mySummary)) return 0;
    const hit = mySummary.find((s) => s.catalogItemId === ticket.id);
    return Number(hit?.quantity ?? 0);
  }, [mySummary, ticket?.id]);

  const isSoldOut = !!ticket?.soldOut || ticket.stock.aviable <= 0;
  const isAtUserLimit = userOwned >= ticket.maxPerPerson;
  const isDisabled = isSoldOut;
  const { isFree } = ticket;

  const toggleTicket = () => {

    if (isAtUserLimit) {
      modalFeedbackReact(
        "Maximo de tickets",
        `No podés superar ${ticket.maxPerPerson} tickets por persona`,
        "warning",
        true
      );
      return;
    }

    if (isSoldOut) return toast.error("Ese tipo de ticket está agotado");
    if (isAtUserLimit && !ticket.isSelected) {
      return toast.warning(
        `Ya alcanzaste el máximo por persona (${ticket.maxPerPerson})`
      );
    }
    if (ticket.isSelected && ticket.quantity > 0) {
      return modalFeedbackReact(
        "Advertencia",
        "Eliminarás este ticket de tu carrito",
        "warning",
        true,
        [
          {
            text: "Eliminar",
            type: "primary",
            action: () =>
              setCheckout({
                ...checkout,
                tickets: checkout.tickets.map((p) =>
                  p.id === ticket.id
                    ? { ...p, quantity: 0, isSelected: false }
                    : p
                ),
              }),
          },
        ]
      );
    }
    setCheckout({
      ...checkout,
      tickets: checkout.tickets.map((p) =>
        p.id === ticket.id ? { ...p, isSelected: !p.isSelected } : p
      ),
    });
  };

  const increaseQuantity = () => {
    // cantidad potencial luego del click
    const nextQuantity = ticket.quantity + 1;

    // Validar límite por persona con el estado futuro
    if (userOwned + nextQuantity > ticket.maxPerPerson) {
      return modalFeedbackReact(
        "Maximo de tickets",
        `No podés superar ${ticket.maxPerPerson} tickets por persona`,
        "warning",
        true
      );
    }

    // Validar stock disponible con el estado futuro
    if (nextQuantity > ticket.stock.aviable) {
      return toast.warning("No hay más tickets disponibles");
    }

    setCheckout({
      ...checkout,
      tickets: checkout.tickets.map((p) =>
        ticket.id === p.id ? { ...p, quantity: nextQuantity } : p
      ),
    });
  };

  const decreaseQuantity = () => {
    setCheckout({
      ...checkout,
      tickets: checkout.tickets.map((p) =>
        ticket.id === p.id
          ? {
              ...p,
              quantity: p.quantity > 0 ? p.quantity - 1 : 0,
            }
          : p
      ),
    });
  };

  return (
    <section className="w-full h-auto p-1 border-none shadow-lg rounded-lg font-body font-medium">
      <button
        type="button"
        onClick={!isDisabled ? toggleTicket : undefined}
        className={`flex flex-row items-center justify-between w-full h-16 p-4 rounded-t-xl bg-dark ${
          isDisabled ? "cursor-default" : ""
        }`}
      >
        <div className="flex gap-2 max-w-[70%]">
          <h4 className="md:text-lg truncate text-ellipsis">{ticket.name}</h4>
          {isFree && (
            <span className="flex items-center px-2 py-1 bg-[#29abd6] rounded-lg shadow text-xs font-semibold text-gray-950 font-headline">
              FREE
            </span>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          {isSoldOut ? (
            <span className="px-2 py-1 bg-red-500 rounded-lg shadow text-xs text-gray-950 font-body">
              SOLD OUT
            </span>
          ) : (
            <>
              <div className="text-lg ">${ticket.price}</div>
              <Image
                width={20}
                height={20}
                alt="circle"
                src={
                  ticket.isSelected
                    ? "/icons/circle-check.svg"
                    : "/icons/circle.svg"
                }
              />
            </>
          )}
        </div>
      </button>
      <div className="w-full min-h-16 h-auto flex flex-col md:flex-row justify-between bg-slate-800 md:bg-background py-4 px-3 gap-4 rounded-b-xl transition-all duration-300">
        <div className={`flex flex-col ${!ticket.isSelected ? "w-full" : 'md:w-2/5'} `}>
          {ticket.description.map((feat, i) => (
            <div key={i} className="flex items-center mr-4">
              <CheckCircle className="h-4 w-4 text-primary/70 mr-4" />
              <span className="text-ellipsis truncate">{feat}</span>
            </div>
          ))}
        </div>
        {!isDisabled && (
          <article
            className={`${
              ticket.isSelected ? "flex" : "hidden"
            } w-auto md:w-1/2 h-16 bg-dark justify-between items-center rounded-lg px-4 py-2`}
          >
            <div>
              <header className="text-sm overflow-hidden text-ellipsis">
                Cant. de Personas
              </header>
              <p className="text-sm text-primary">
                {ticket.stock.aviable} restantes
              </p>
            </div>
            <div className="bg-primary/30 flex justify-around items-center px-3 py-1.5 rounded-lg gap-x-4">
              <button
                type="button"
                onClick={decreaseQuantity}
                className="text-2xl font-bold"
              >
                <Image
                  src="/icons/minus.svg"
                  alt="minus"
                  width={18}
                  height={18}
                />
              </button>
              <span className="text-primary text-lg">{ticket.quantity}</span>
              <button
                type="button"
                onClick={increaseQuantity}
                className="text-2xl font-bold"
              >
                <Image src="/icons/add.svg" alt="plus" width={18} height={18} />
              </button>
            </div>
          </article>
        )}
      </div>
    </section>
  );
};

export default EventTicket;