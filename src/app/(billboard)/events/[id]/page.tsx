"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  useSearchParams,
  useParams,
  usePathname,
  useRouter,
} from "next/navigation";
import EventBuyTag from "@/components/events/event-buy-tag";
import { useEventContext } from "./context/eventContext";
import { useRRPP } from "@/contexts/rrpp-context";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { API_BASE_URL, credentialsOption } from "@/services/enviroment";
import { useUser } from "@/contexts/user-context";
import { useUI } from "@/contexts/ui-context";
import { CompleteProfileModal } from "@/components/auth/complete-profile-modal";
import modalFeedbackReact from "@/components/shared/feedback-modal";

type TokenInfo = {
  token?: string;
  code?: string;
};

export default function EventDetailPage() {
  const { logged, user } = useUser();
  const { event } = useEventContext();

  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const accessesid = searchParams.get("accessesid") || undefined;

  const pathname = usePathname();
  const router = useRouter();

  const { id } = useParams() as { id: string };
  const { resolveRRPPToken } = useRRPP();

  const storeCurrentAndGoLogin = () => {
    try {
      if (typeof window !== "undefined") {
        const sp = searchParams.toString();
        const hash = window.location.hash || "";
        const back = `${pathname}${sp ? `?${sp}` : ""}${hash}`;
        sessionStorage.setItem("postLoginRedirect", back);
      }
    } catch {}
    router.push("/login");
  };
  const [rrppTokenInfo, setRrppTokenInfo] = useState<TokenInfo>({});

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [meAlias, setMeAlias] = useState<string | null>(null);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const { setIsProfileModalOpen, isProfileModalOpen } = useUI();

  const cerrar = () => {
    router.push("/");
    setIsProfileModalOpen(false);
  };

  // const query = encodeURIComponent(event?.address.description)

  const buildBuyLink = (kind: "combo" | "ticket" | string) => {
    const buyUrl = kind.includes("combo")
      ? `/events/${id}/place/checkout?type=${kind}`
      : event?.type === "traditional"
      ? `/events/${id}/place/checkout?type=${kind}`
      : `/events/${id}/place?type=${event?.type}`;

    return logged ? buyUrl : "/login";
  };

  const handleBuyClickIfNotLogged: React.MouseEventHandler<
    HTMLButtonElement
  > = (e) => {
    if (logged) return;
    e.preventDefault();
    storeCurrentAndGoLogin();
  };

  useEffect(() => {
    if (accessesid) setAcceptOpen(true);
  }, [accessesid]);

  const clearAccessQuery = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("accessesid");
    next.delete("token");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleReject = () => {
    setAcceptOpen(false);
    clearAccessQuery();
    toast.message("Solicitud de ticket rechazada");
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (!accessesid) return;
      try {
        const res = await fetch(`${API_BASE_URL}/users/current`, {
          method: "GET",
          credentials: credentialsOption,
          headers: { "Content-Type": "application/json;charset=UTF-8" },
        });
        if (res.status === 401) {
          setMeAlias(null);
          return; // no logueado
        }
        if (!res.ok) throw new Error("me failed");
        const me = await res.json();
        setMeAlias(String(me?.alias || "").trim() || null);
      } catch {
        setMeAlias(null);
      }
    };
    fetchMe();
  }, [accessesid]);

  const handleAccept = async () => {
    if (!accessesid) return;
    if (!meAlias) {
      storeCurrentAndGoLogin();
      return;
    }
    setLoadingAccept(true);
    try {
      const res = await fetch(`${API_BASE_URL}/accesses/assign`, {
        method: "POST",
        credentials: credentialsOption,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({ alias: meAlias, accessId: accessesid }),
      });

      if (res.status === 401) {
        storeCurrentAndGoLogin();
        return;
      }

      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        toast.error(message || "No se pudo aceptar el ticket.");
        return;
      }

      toast.success("¡Ticket aceptado!");
      setAcceptOpen(false);
      router.push(`/my-tickets/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado al aceptar el ticket.");
    } finally {
      setLoadingAccept(false);
    }
  };

  useEffect(() => {
    let cancel = false;

    if (logged && user?.completed === false) {
      setIsProfileModalOpen(true);
    } else {
      setIsProfileModalOpen(false);
    }

    const run = async () => {
      if (!token) {
        setRrppTokenInfo({});
        return;
      }
      try {
        const data = await resolveRRPPToken(token);
        if (data && data?.events && id) {
          const ev = data?.events.find((e: any) => e.eventId === id);
          if (ev) {
            sessionStorage.setItem(
              `rrpp:${ev.eventId}`,
              JSON.stringify({
                id: data.id,
                code: ev.code,
                userId: data.userId,
                discount: ev.commisions.discount ?? 0,
              })
            );
          }
        }
      } catch {
        if (!cancel) setRrppTokenInfo({ token });
      }
    };

    run();
    return () => {
      cancel = true;
    };
  }, [
    token,
    resolveRRPPToken,
    id,
    logged,
    user?.completed,
    setIsProfileModalOpen,
  ]);

  const {
    combos,
    allTickets,
    allSeats,
    lowestSeatPrice,
    lowestTicketPrice,
    lowestComboPrice,
  } = useMemo(() => {
    const items = event?.catalogItems ?? [];

    const allTickets = items.filter(
      (it: any) => it?.type === "ticket" && it?.visible
    );

    const allSeats = items.filter(
      (it: any) => it?.type === "seats" && it?.visible
    );

    const combos = items.filter(
      (it: any) =>
        (it?.type === "comboM" || it?.type === "comboX") && it?.visible
    );
    // >>> FIX: usar isFree correctamente y evitar que un array truthy devuelva 0
    const lowest = (arr: any[]) => {
      if (!Array.isArray(arr) || arr.length === 0) return undefined;

      // Gratis SOLO si existe al menos un item con isFree === true
      const hasFree = arr.some((t: any) => t?.isFree === true);
      if (hasFree) return 0;

      // Caso contrario, mínimo entre precios válidos (> 0 y numéricos)
      const prices = arr
        .map((x) => Number(x?.price))
        .filter((p) => Number.isFinite(p) && p > 0);

      return prices.length ? Math.min(...prices) : undefined;
    };
    // <<< FIN FIX

    return {
      combos,
      allTickets,
      allSeats,
      lowestSeatPrice: lowest(allSeats),
      lowestTicketPrice: lowest(allTickets),
      lowestComboPrice: lowest(combos),
    };
  }, [event?.catalogItems]);

  // ====== MAPS EMBED (key pública + place_id preferido) ======
  const MAPS_KEY =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;

  const mapQuery = event?.address?.place_id
    ? `place_id:${encodeURIComponent(event.address.place_id)}`
    : encodeURIComponent(event?.address?.description ?? "");

  const mapSrc = MAPS_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${mapQuery}`
    : "";

  const renderValue: boolean =
    Boolean(allTickets?.length) || Boolean(combos?.length);

  useEffect(() => {
    if (event?.exclusive) {
      modalFeedbackReact(
        "Venta exclusiva!",
        "Este evento es de venta exclusiva.Solo podrán adquirir entradas los socios que se encuentren al día con la cuota.",
        "warning",
        true
      );
    }
  }, []);

  return (
    <>
      <Dialog
        open={acceptOpen}
        onOpenChange={(o) => (o ? setAcceptOpen(true) : handleReject())}
      >
        <DialogTitle className="hidden" />
        <DialogContent className="max-w-xs sm:max-w-sm px-8 py-8 rounded-lg border-none bg-dark">
          <div className="w-full flex flex-col items-center gap-5">
            <h2 className="text-lg font-headline font-semibold text-center">
              ¿Querés aceptar este ticket?
            </h2>
            <DialogDescription className="text-center">
              Si aceptás, el ticket quedará asignado a tu cuenta.
            </DialogDescription>

            <div className="w-full text-xs text-slate-300 bg-slate-800/60 rounded-md p-3">
              <div>
                <span className="text-slate-400">Evento:</span>{" "}
                {event?.name || id}
              </div>
              {!meAlias && (
                <div className="text-amber-400 mt-4">
                  Necesitás iniciar sesión para aceptar.
                </div>
              )}
            </div>

            <div className="flex justify-between w-full gap-4 mt-2">
              {!meAlias ? (
                <button
                  type="button"
                  onClick={storeCurrentAndGoLogin}
                  className="w-full py-2.5 rounded-md bg-primary text-black font-semibold hover:bg-primary/80 transition-colors"
                >
                  Iniciar sesión
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="w-1/2 py-2.5 rounded-md border border-destructive text-destructive font-medium hover:bg-destructive/10 transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={loadingAccept}
                    className="w-1/2 py-2.5 rounded-md bg-primary text-black font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    {loadingAccept ? "Aceptando..." : "Aceptar"}
                  </button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CompleteProfileModal closeFunct={cerrar} open={isProfileModalOpen} />

      <section className="flex flex-col md:flex-row-reverse bg-background md:px-[20vh] gap-x-8 py-8 px-4">
        <div className="flex flex-col gap-4">
          {Boolean(combos?.length) && typeof lowestComboPrice === "number" && (
            <EventBuyTag
              price={`Desde $${lowestComboPrice}`}
              link={buildBuyLink("combo")}
              title="COMPRA TU COMBO"
              altIcon="User"
              icon="/icons/users.svg"
              type="combo"
            />
          )}

          {Boolean(allTickets?.length) &&
            typeof lowestTicketPrice === "number" && (
              <EventBuyTag
                price={`Desde $${lowestTicketPrice}`}
                link={buildBuyLink("ticket")}
                title="COMPRA TU ENTRADA"
                altIcon="User"
                icon="/icons/entrance.svg"
                type="ticket"
              />
            )}

          {Boolean(allSeats?.length) && typeof lowestSeatPrice === "number" && (
            <EventBuyTag
              price={`Desde $${lowestSeatPrice}`}
              link={buildBuyLink("ticket")}
              title="COMPRA TU ENTRADA"
              altIcon="User"
              icon="/icons/entrance.svg"
              type="ticket"
            />
          )}
          {renderValue && (
            <p className="text-sm">
              Al valor indicado, se sumará el costo por servicio.
            </p>
          )}
          {rrppTokenInfo.code && (
            <div className="text-xs text-primary bg-primary/10 rounded-md px-3 py-2 w-fit">
              Código RRPP aplicado:{" "}
              <span className="font-semibold">{rrppTokenInfo.code}</span>
            </div>
          )}

          <div className="w-full md:w-80 h-auto bg-light shadow-lg text-primary rounded-lg flex flex-col items-center justify-start gap-4 p-4 text-light">
            <div className="flex flex-row gap-x-4 items-start">
              <Image
                src="/icons/streaming.svg"
                width={40}
                height={40}
                alt="users"
              />
              <div className="flex flex-col">
                <h3 className="font-medium text-base">
                  Conocé nuestro canal de Streaming
                </h3>
                <h6 className="text-sm">
                  Vivi lo mejor de la Liga Nacional de Basquet Online!
                </h6>
              </div>
            </div>
            <div className="p-1 rounded-xl bg-white">
              <Image
                src="/icons/qr-code.svg"
                width={200}
                height={200}
                alt="qrCode"
                className=" block"
              />
            </div>
          </div>
        </div>

        <article className="flex flex-col gap-4 grow">
          <h6 className="my-2 font-semibold block md:hidden">Descripcion</h6>
          <div className="flex flex-col items-start bg-light shadow-lg text-primary p-3 rounded-lg h-min grow">
            <p className="whitespace-pre-wrap">{event?.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold font-headline">Lugar</h3>
            <h6 className="text-base font-semibold">
              {event?.address?.description}
            </h6>

            {MAPS_KEY ? (
              <iframe
                width="100%"
                height="300"
                className="rounded-lg"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapSrc}
              />
            ) : (
              <div className="rounded-lg bg-slate-900 p-4 text-sm">
                Falta configurar <code>NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY</code>.
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
