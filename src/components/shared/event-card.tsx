import Image from "next/image";
import Link from "next/link";
import HeadText from "../common/common-head-text";
import { QrCode } from "lucide-react";
import CommonModal from "../common/common-modal";
import DynamicQR from "./my-qr";
import { useState } from "react";

// 👇 Tipos defensivos (no dependemos de "Event" de otro archivo)
type Maybe<T> = T | null | undefined;
type Category = { name?: string } | null | undefined;
type Address = { description?: string } | string | null | undefined;

export interface EventCardProp {
  id: string;
  name?: string;
  flyer?: string; // opcional
  banner?: string; // por si viene así en otros endpoints
  address?: Address; // puede venir objeto, string o nada
  startDate?: string; // "YYYY-MM-DD HH:mm" o similar
  category?: Category;
  extend?: boolean;
  href?: string;
  soldOut?: boolean;
  exclusive?: boolean;
  myTicket?: boolean
}

export function EventCard({
  id,
  name,
  flyer,
  banner,
  address,
  startDate,
  extend,
  category,
  href,
  soldOut,
  exclusive,
  myTicket = false
}: EventCardProp) {
  // -------- helpers seguros --------
  const [open, setOpen] = useState(false)

  const getDates = () => {
    if (!startDate) return { date: "...", time: "..." };
    // admite "YYYY-MM-DD HH:mm" o ISO; si no matchea, devolvemos todo en date
    const parts = startDate.split(" ");
    if (parts.length >= 2) return { date: parts[0], time: parts[1] };
    return { date: startDate, time: "..." };
  };

  const getAddressText = (addr: Address): string => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    return addr.description ?? "";
  };

  const title = name ?? "Evento";
  const categoryText = category?.name ?? "";
  const addressText = getAddressText(address);

  // imagen de fallback si no viene flyer/banner
  const imageSrc = flyer || banner || "/images/placeholder-event.png"; // asegurate de tener un placeholder en /public/images

  return (
    <>
    <div className="relative">
      <Link
        href={href || "/"}
        className={`${extend
          ? "w-[75vw] md:min-w-80 max-w-xs 2xl:min-w-96 2xl:max-w-sm h-96 xl:h-[400px]"
          : "w-[75vw] md:w-72 2xl:min-w-80 2xl:max-w-xs h-[380px]"
          } h-[345px] flex flex-col border-none shadow-lg transition-all duration-300 hover:shadow-gray-800 `}
      >
        <Image
          src={imageSrc}
          alt={`Logo ${id}`}
          width={400}
          height={400}
          quality={100}
          className="w-full h-1/2 object-cover rounded-t-xl"
        />

        <article className={`h-1/2 flex flex-col font-headline items-start justify-start py-2 px-6 gap-y-1 bg-light ${!myTicket && 'rounded-b-xl'}`}>
          <div className="flex w-full justify-between items-center">
            <h5
              className={`${extend ? "text-sm font-medium" : "text-xs font-medium"
                }`}
            >
              {categoryText}
            </h5>
            {
              soldOut ?
                <span className='px-2 py-1 bg-red-500 rounded-lg shadow text-xs font-semibold text-gray-950 font-headline'>SOLD OUT</span>
                : exclusive &&
                <span className='px-2 py-1 bg-yellow-500 rounded-lg shadow text-xs font-semibold text-gray-950 font-headline'>EXCLUSIVO</span>
            }
          </div>


          <h3
            className={`${extend ? "text-xl md:text-2xl font-semibold" : " text-lg md:text-xl font-medium"
              }`}
          >
            {title}
          </h3>

          <article className={`flex flex-wrap items-center gap-x-8 h-2/3  `}>
            <HeadText head="Fecha" description={getDates().date} />
            <HeadText head="Horario" description={getDates().time} />
            <div
              className={`${extend ? "w-56 max-w-56 md:w-60 md:max-w-60 2xl:w-80 2xl:max-w-80" : "w-56 max-w-56 md:w-60 md:max-w-60"
                }`}
            >
              <h3 className="text-sm text-primary">Dirección</h3>
              <p className="block text-sm truncate overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {addressText}
              </p>
            </div>
          </article>
        </article>
      </Link>
      {
        myTicket &&
        <button type="button" onClick={() => setOpen(true)} className="absolute rounded-b-xl  bg-primary/50 -bottom-12 h-12 w-[75vw] md:w-72 2xl:min-w-80 2xl:max-w-xs flex items-center justify-around hover:bg-primary/40">
          <h4 className="font-medium text-base">Mostrar QR de Ingreso</h4>
          <QrCode className="h-9 w-9 md:mr-2 text-primary" />
        </button>
      }
    </div>
    {/* Modal QR */}
      <CommonModal open={open} setOpen={setOpen}>
        <DynamicQR />
      </CommonModal>
      </>
  );
}
