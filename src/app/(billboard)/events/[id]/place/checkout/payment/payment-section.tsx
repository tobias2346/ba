"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import CommonButton from "@/components/common/common-button";
import { useEventContext } from "../../../context/eventContext";
import { useRouter } from "next/navigation";
import modalFeedbackReact from "@/components/shared/feedback-modal";
import LoaderModal from "@/components/shared/loader-modal";
import { toast } from "sonner";
import { API_BASE_URL } from "@/services/enviroment";
import { useUser } from "@/contexts/user-context";
import { useRRPP } from "@/contexts/rrpp-context";

type PromoSnap = {
  id: string;
  code: string;
  userId?: string;
  discount: number;
};

const paymentMethods = [
  { id: "mercadopago", name: "Mercado Pago", icon: "/brands/mp.png" },
];

const PaymentSection = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | false>(false);
  const [paying, setPaying] = useState(false);

  const [promo, setPromo] = useState<PromoSnap | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [validating, setValidating] = useState(false);

  const router = useRouter();
  const { event, checkout } = useEventContext();
  const { user } = useUser();
  const { validateRRPPCode } = useRRPP();

  const entorno = process.env.NEXT_PUBLIC_ENTORNO;
  const credentialsOption: RequestCredentials =
    entorno !== "develop" ? "include" : "omit";

  const isFreeOrder = useMemo(() => {
    const lines = checkout.tickets.filter((t) => t.quantity > 0);
    if (!lines.length) return false;
    return lines.every((t) => t.isFree === true);
  }, [checkout.tickets]);

  const storageKey = useMemo(
    () => (event?.id ? `rrpp:${event.id}` : ""),
    [event?.id]
  );

  const readPromoFromStorage = () => {
    if (!storageKey) return null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        id: String(parsed.id || ""),
        code: String(parsed.code || "").toUpperCase(),
        userId: parsed.userId,
        discount: Number(parsed.discount ?? 0) || 0,
      } as PromoSnap;
    } catch {
      return null;
    }
  };

  const savePromo = (snap: PromoSnap) => {
    if (!storageKey) return;
    sessionStorage.setItem(storageKey, JSON.stringify(snap));
    setPromo(snap);
  };

  const fetchActivePromo = async () => {
    if (!event?.id) return;
    try {
      const url = new URL(`${API_BASE_URL}/rrpp/resolve-active`);
      url.searchParams.set("eventId", event.id);
      const res = await fetch(url.toString(), {
        credentials: credentialsOption,
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      const discount =
        Number(
          data?.event?.commisions?.discount ??
          data?.event?.commissions?.discount ??
          0
        ) || 0;
      const code = (data?.event?.code || "").toUpperCase();
      if (code) {
        savePromo({
          id: data.rrpp?.id,
          code,
          userId: data?.claims?.u || data?.rrpp?.userId,
          discount,
        });
      }
    } catch { }
  };

  const validateCodeOnServer = async (code: string) => {
    if (!event?.id) return false;
    try {
      const data = await validateRRPPCode(event.id, code);
      if (!data) return false;

      const discount = Number(data.discount ?? 0) || 0;
      const id = data.id;
      const userId = data.userId;
      savePromo({ id: id, code: code.toUpperCase(), userId, discount });

      return true;
    } catch {
      return false;
    }
  };

  const totals = useMemo(() => {
    if (!event)
      return { base: 0, fee: 0, discount: 0, discountAmount: 0, total: 0 };

    const base = checkout.tickets.reduce(
      (acc, item) => acc + item.price * item?.quantity || 0,
      0
    );
    const type = checkout.tickets[0]?.type;
    const svcPct =
      type === "comboX"
        ? Number(event.store.serviceCharge?.combos ?? 0)
        : Number(event.store.serviceCharge?.tickets ?? 0);

    const fee = Math.round((base * svcPct) / 100);

    const discount = Number(promo?.discount ?? 0);
    const discountAmount = Math.round((base * discount) / 100);

    const total = Math.max(0, base + fee - discountAmount);

    return { base, fee, discount, discountAmount, total, svcPct };
  }, [event, checkout, promo]);

  const goBack = () => router.back();

  const confirmation = () =>
    modalFeedbackReact(
      "Confirmación",
      "¿Seguro que deseas pagar?",
      "info",
      true,
      [{ text: "Pagar", action: pay, type: "primary" }]
    );

  const createPreference = async (payload: any) => {
    const sc = totals.svcPct;

    if (sc || sc === 0) {
      const res = await fetch(`${API_BASE_URL}/payments/create-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: credentialsOption,
        body: JSON.stringify({
          ...payload,
          sc,
          userId: user?.id,
          rrppId: promo?.id || null,
        }),
      });

      if (!res.ok) {
        let errMsg = "Error creando preferencia";
        try {
          const e = await res.json();
          if (e?.message) {
            if (e.message.includes("excede el máximo permitido")) {
              errMsg = "Máximo por persona para este item excedido";
            } else if (e.message.includes("sin stock/oculto o inexistente")) {
              errMsg = "Item agotado";
            } else {
              errMsg = e.message;
            }
          }
        } catch { }
        throw new Error(errMsg);
      }

      const data = await res.json();
      const { txId, preferenceId, init_point, expiresAt, total } = data;
      localStorage.setItem(
        "pendingTx",
        JSON.stringify({ txId, preferenceId, expiresAt, total })
      );

      window.location.href = init_point;
      return data;
    }
  };

  const pay = async () => {
    setPaying(true);
    try {
      let items = [];

      if ((event!.type == "numerated" && checkout?.selectedButacas?.length > 0)) {
        items = checkout.tickets
          .filter((l) => l.quantity > 0)
          .map((l) => ({
            catalogItemId: l.id,
            codes: checkout.selectedButacas,
          }));
      } else {
        items = checkout.tickets
          .filter((l) => l.quantity > 0)
          .map((l) => ({
            catalogItemId: l.id,
            quantity: l.quantity,
          }));
      }

      const payload = {
        eventId: event!.id,
        items,
      };

      await createPreference(payload);
    } catch (err: any) {
      modalFeedbackReact(
        "No se pudo iniciar la compra",
        err.message,
        "error",
        true
      );
      setPaying(false);
    }
  };

  // 🔹 Flujo gratuito (sin pasarela)
  const confirmFree = async () => {
    setPaying(true);
    try {
      const items = checkout.tickets
        .filter((l) => l.quantity > 0)
        .map((l) => ({
          catalogItemId: l.id,
          quantity: l.quantity,
        }));

      const res = await fetch(`${API_BASE_URL}/payments/free-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: credentialsOption,
        body: JSON.stringify({
          eventId: event!.id,
          items,
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => null);
        throw new Error(
          e?.message || "No se pudo completar el canje gratuito."
        );
      }

      toast.success("¡Entradas gratuitas adquiridas!");
      router.push(`/my-tickets/${event!.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al confirmar entradas gratuitas.");
      setPaying(false);
    }
  };

  useEffect(() => {
    const available = checkout.tickets.some((t) => t.quantity > 0);
    if (!available) {
      router.push("/");
      toast.error("Debes completar todos los pasos de compra");
      return;
    }
  }, [checkout, router]);

  useEffect(() => {
    if (!event?.id) return;
    // Si es flujo gratuito, no cargamos promo ni resolvemos código activo
    if (isFreeOrder) return;
    const snap = readPromoFromStorage();
    if (snap) setPromo(snap);
    fetchActivePromo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, isFreeOrder]);

  const handleValidateClick = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setValidating(true);

    const ok = await validateCodeOnServer(code);

    if (ok) {
      toast.success("Código aplicado 🎟️");
      setCodeInput("");
      setValidating(false);
      return;
    }

    if (promo && promo.code === code) {
      toast.success("Código aplicado 🎟️");
    } else {
      toast.error("No pudimos validar el código");
    }
    setValidating(false);
  };

  const hasPromo = !!promo?.code;

  return (
    <>
      {/* Detalle */}
      <article className="w-full h-auto flex flex-col justify-start items-start gap-3 p-4 shadow md:bg-slate-800 rounded-xl text-slate-200">
        <h5 className="text-lg text-light font-semibold font-headline my-1">
          Detalle de la {isFreeOrder ? "adquisición" : "compra"}
        </h5>

        <div className="w-full flex justify-between items-center">
          <h4>Descripción del evento</h4>
          <h4>{event?.name}</h4>
        </div>

        {checkout.tickets.map(
          (ticket) =>
            ticket.quantity > 0 && (
              <div
                className="w-full flex items-center justify-between"
                key={ticket.id}
              >
                <h4>
                  {ticket.name} X{ticket.quantity}
                </h4>
                <h4>${ticket.price * ticket.quantity}</h4>
              </div>
            )
        )}

        <div className="w-full flex items-center justify-between">
          <h4>Costo del servicio</h4>
          <h4>${totals.fee}</h4>
        </div>

        {!isFreeOrder && (
          <div className="w-full flex justify-between items-center text-success">
            <div className="flex items-center gap-2">
              <h4>Descuento promocional</h4>
            </div>
            <h4>${totals.discountAmount}</h4>
          </div>
        )}

        <div className="w-full flex justify-between items-center mt-4 text-xl font-semibold text-light font-headline">
          <h4>Total</h4>
          <h4>${totals.total}</h4>
        </div>
      </article>

      {/* 🔒 Ocultar promo si la orden es gratuita */}
      {!isFreeOrder && (
        <article className="w-full flex flex-col gap-4 shadow rounded-xl md:bg-slate-800 p-4 text-slate-200">
          {!hasPromo && <h5>¿Tenés código promocional?</h5>}
          <div className="flex w-full h-14 md:h-auto gap-4 ">
            <div className="bg-dark flex items-center justify-between rounded-lg gap-x-4 w-1/2 md:w-max lg:w-3/4 xl:w-3/5 2xl:w-1/2">
              {hasPromo ? (
                <>
                  <div className="w-full md:grow h-11 flex items-center px-2 bg-transparent">
                    Código aplicado: {promo!.code}
                  </div>
                  <Image
                    src="/icons/check-ghost.svg"
                    alt="check"
                    className="mr-2"
                    width={26}
                    height={26}
                  />
                </>
              ) : (
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={
                    hasPromo
                      ? `Código aplicado: ${promo!.code}`
                      : "Ingresá tu código"
                  }
                  className="w-full md:grow h-full px-2 bg-transparent"
                />
              )}
            </div>
            {!hasPromo && (
              <CommonButton
                text={validating ? "Validando..." : "Validar código"}
                type="ghost"
                disabled={validating || !codeInput.trim()}
                action={handleValidateClick}
              />
            )}
          </div>
          {hasPromo && (
            <p className="text-xs text-muted-foreground">
              El descuento se aplica sobre el subtotal de productos (no incluye
              costos por servicio).
            </p>
          )}
        </article>
      )}

      {/* 🔒 Ocultar métodos de pago si es gratuito */}
      {!isFreeOrder && (
        <article className="w-full flex flex-col items-center gap-y-8">
          <h2 className=" font-semibold text-lg font-headline">
            Selecciona método de pago
          </h2>
          <div className="w-full h-auto flex items-center justify-around flex-wrap p-4 rounded-xl md:bg-slate-800 gap-4">
            {paymentMethods.map((method) => (
              <button
                type="button"
                key={method.id}
                className={cn(
                  "bg-dark rounded-xl flex items-center justify-center w-80 h-20",
                  selectedMethod === method.id && "bg-primary"
                )}
                onClick={() => setSelectedMethod(method.id)}
              >
                <Image
                  src={method.icon}
                  alt={method.name}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </article>
      )}

      {/* CTA */}
      <div className=" w-full px-6 md:p-0">
        <section className="w-full flex items-center justify-between md:justify-end gap-x-4">
          <CommonButton
            type="ghost"
            extend
            text="Volver atrás"
            action={goBack}
          />
          {isFreeOrder ? (
            <CommonButton
              disabled={paying}
              type="primary"
              extend
              text="Confirmar"
              action={confirmFree}
            />
          ) : (
            <CommonButton
              disabled={(!selectedMethod as boolean) || paying}
              type="primary"
              extend
              text="Pagar"
              action={confirmation}
            />
          )}
        </section>
      </div>

      <LoaderModal
        icon="/icons/pending.svg"
        open={paying}
        description={isFreeOrder ? "Confirmando..." : "Espera un momento..."}
        title={isFreeOrder ? "Procesando canje" : "Procesando pago"}
      />
    </>
  );
};

export default PaymentSection;
