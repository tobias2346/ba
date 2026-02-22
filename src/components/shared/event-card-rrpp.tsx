import Image from "next/image";
import Link from "next/link";
import HeadText from "../common/common-head-text";

// 👇 Tipos defensivos (no dependemos de "Event" de otro archivo)
type Category = { name?: string } | null | undefined;
type Address = { description?: string } | string | null | undefined;

export interface EventCardRrppProp {
  id: string;
  name?: string;
  flyer?: string; // opcional
  banner?: string; // por si viene así en otros endpoints
  address?: Address; // puede venir objeto, string o nada
  startDate?: string; // "YYYY-MM-DD HH:mm" o similar
  category?: Category;
  extend?: boolean;
  href?: string;
}

export function EventCardRrpp({
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
}: EventCardRrppProp) {
  // -------- helpers seguros --------
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

  // imagen de fallback si no viene flyer/banner
  const imageSrc = flyer || banner || "/images/placeholder-event.png"; // asegurate de tener un placeholder en /public/images

  return (
    <Link
      href={href || "/"}
      className='w-[75vw] md:w-72 2xl:min-w-80 2xl:max-w-xs h-96 overflow-hidden flex flex-col border-none shadow-lg rounded-xl transition-all duration-300 hover:shadow-gray-800 relative'
    >
      <Image
        src={imageSrc}
        alt={`Logo ${id}`}
        width={400}
        height={400}
        quality={100}
        className="w-full h-1/2 object-cover"
      />

      <article className="h-1/2 flex flex-col font-headline items-start justify-start py-2 px-6 gap-y-1 bg-slate-800">
        <div className="flex w-full justify-between items-center">
          <h5
            className={`${extend ? "text-sm font-medium" : "text-xs font-medium"
              }`}
          >
            {categoryText}
          </h5>
          {
            soldOut &&
            <span className='px-2 py-1 bg-red-500 rounded-lg shadow text-xs font-semibold text-gray-950 font-headline'>SOLD OUT</span>
          }
        </div>


        <h3
          className={`${extend ? "text-xl md:text-2xl font-semibold" : " text-lg md:text-xl font-medium"
            }`}
        >
          {title}
        </h3>

        <article className="flex flex-wrap items-center gap-x-8 h-2/3">
          <HeadText head="Fecha" description={getDates().date} />
          <HeadText head="Horario" description={getDates().time} />
        </article>
        <div className="w-full flex justify-center items-center">
          <button className="flex justify-center items-center h-9 w-full border border-primary rounded-lg text-sm font-semibold text-primary">Gestionar evento y links</button>
        </div>
      </article>
    </Link>
  );
}
