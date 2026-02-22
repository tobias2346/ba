"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CommonButton from "@/components/common/common-button";
import { Logo } from "@/components/icons/logo";
import HeadText from "@/components/common/common-head-text";
import { API_BASE_URL } from "@/services/enviroment";

type FeedbackType = "approved" | "pending" | "rejected";

interface FeedbackConfig {
  icon: string;
  title: string;
  subtitle?: string;
  badgeText: string;
  badgeColor: string;
}

const feedbackConfig: Record<FeedbackType, FeedbackConfig> = {
  approved: {
    icon: "/icons/success.svg",
    title: "Compra exitosa",
    subtitle: undefined,
    badgeText: "Aprobado",
    badgeColor: "#3CE725",
  },
  pending: {
    icon: "/icons/pending.svg",
    title: "Pendiente de aprobación",
    subtitle: "Tu pago está siendo procesado.\n¡No cierres esta ventana!",
    badgeText: "Pendiente",
    badgeColor: "#EE9F27",
  },
  rejected: {
    icon: "/icons/failed.svg",
    title: "Compra rechazada",
    subtitle: "Intentá nuevamente con otra tarjeta.",
    badgeText: "Rechazado",
    badgeColor: "#E13A3A",
  },
};

type TxItem = {
  catalogItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type TxData = {
  event?: {
    name?: string;
    startDate?: string | Date;
    address?: { description?: string } | string;
  };
  items?: TxItem[];
  subtotal?: number;
  serviceCharge?: number;
};

export default function page() {
  const params = useParams<{ type: FeedbackType }>();
  const type = (params?.type || "approved") as FeedbackType;

  const sp = useSearchParams();
  const externalRef = sp.get("external_reference") || "";
  const paymentId = sp.get("payment_id") || sp.get("collection_id") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [putDone, setPutDone] = useState<boolean>(false);
  const [data, setData] = useState<TxData | null>(null);
  const [getErr, setGetErr] = useState<string>("");

  const config = feedbackConfig[type];

  // PUT paymentId (si corresponde) y luego GET de la transacción – todo en cliente
  useEffect(() => {
    let canceled = false;

    async function run() {
      try {
        // 1) PUT paymentId si hay datos (endpoint público, pero enviamos credenciales igual)
        if (externalRef && paymentId) {
          try {
            await fetch(`${API_BASE_URL}/transactions/${externalRef}/payment-id`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ paymentId }),
            });
            if (!canceled) setPutDone(true);
          } catch (e) {
            console.error("PUT paymentId failed", e);
          }
        } else {
          setPutDone(true); // nada que hacer
        }

        // 2) GET de la transacción (protegido por onlyLogged, por eso credentials: 'include')
        if (externalRef) {
          const res = await fetch(`${API_BASE_URL}/transactions/${externalRef}`, {
            credentials: "include",
            cache: "no-store",
          });
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(
              `GET /transactions/${externalRef} -> ${res.status}: ${txt}`
            );
          }
          const json = (await res.json()) as TxData;
          if (!canceled) setData(json);
        }
      } catch (err: any) {
        console.error("Feedback fetch flow error:", err?.message || err);
        if (!canceled)
          setGetErr(err?.message || "Error al traer la transacción");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    run();
    return () => {
      canceled = true;
    };
  }, [externalRef, paymentId]);

  const { date, time } = useMemo(() => {
    const start = data?.event?.startDate ?? "";
    if (typeof start === "string" && start.includes(" ")) {
      const [d, t] = start.split(" ");
      return { date: d, time: t };
    }
    try {
      const dt = new Date(start as any);
      if (!isNaN(dt.getTime())) {
        return {
          date: dt.toLocaleDateString(),
          time: dt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
    } catch {}
    return { date: "...", time: "..." };
  }, [data?.event?.startDate]);

  const entries = Array.isArray(data?.items) ? data!.items! : [];
  const serviceCharge = Number(data?.serviceCharge || 0);
  const subtotal = Number(data?.subtotal || 0);

  return (
    <section className="flex flex-col justify-center items-center mt-20">
      <Image width={80} height={80} alt={config.title} src={config.icon} />
      <h3 className="my-2 text-xl font-semibold">{config.title}</h3>

      {config.subtitle && (
        <h5
          className="my-2 text-center whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: config.subtitle }}
        />
      )}

      <div className="w-80 bg-secondary rounded-lg shadow h-14 flex items-center justify-between px-4">
        <Logo alt="logo" width={100} height={100} />
        <div
          className="flex justify-between items-center px-4 py-1 shadow text-black rounded-lg font-semibold"
          style={{ backgroundColor: config.badgeColor }}
        >
          {config.badgeText}
        </div>
      </div>

      <div className="w-80 bg-secondary rounded-lg shadow flex flex-col justify-start p-4 mb-4 font-headline gap-2">
        {/* Loading / error */}
        {loading && <p className="opacity-70">Cargando...</p>}
        {!loading && getErr && (
          <p className="text-red-400 whitespace-pre-wrap">Error: {getErr}</p>
        )}

        {!loading && !getErr && (
          <>
            <h4 className="font-semibold">{data?.event?.name || "..."}</h4>

            {/* Detalle de ítems */}
            <div className="flex flex-col gap-2">
              {entries.map((it) => (
                <div
                  key={it.catalogItemId}
                  className="flex justify-between items-center w-full"
                >
                  <h6 className="text-medium">
                    {it.name} x{it.quantity}
                  </h6>
                  <h6 className="text-medium">
                    ${Number(it.unitPrice || 0) * Number(it.quantity || 0)}
                  </h6>
                </div>
              ))}

              {/* Service Charge separado */}
              {serviceCharge > 0 && (
                <div className="flex justify-between items-center w-full">
                  <h6 className="text-medium">Service Charge</h6>
                  <h6 className="text-medium">${serviceCharge}</h6>
                </div>
              )}

              <span className="h-px bg-gray-900 w-full"></span>

              {/* Total */}
              <div className="flex justify-between items-center w-full font-semibold">
                <h6 className="text-medium">Subtotal</h6>
                <h6 className="text-medium">${subtotal}</h6>
              </div>
            </div>

            <span className="h-px bg-gray-900 w-full"></span>
            <HeadText head="Fecha" description={date} />
            <HeadText head="Horario" description={time} />
            <HeadText
              head="Lugar"
              description={
                (data?.event?.address as any)?.description ||
                (data?.event?.address as string) ||
                "..."
              }
            />
          </>
        )}
      </div>

      <Link href="/my-tickets">
        <CommonButton text="Ir a mis tickets" type="primary" />
      </Link>

      {/* Debug liviano opcional */}
      {/* <pre className="text-xs opacity-60 mt-4">{JSON.stringify({ externalRef, paymentId, putDone, loading }, null, 2)}</pre> */}
    </section>
  );
}
