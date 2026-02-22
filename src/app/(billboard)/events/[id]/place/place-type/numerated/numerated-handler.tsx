'use client'
import React, { useState, useMemo, useEffect } from 'react'
import Butaca from './numerated-butaca'
import NumeratedSelector from './numerated-selector'
import { useEventContext } from '../../../context/eventContext'
import CommonButton from '@/components/common/common-button'
import { usePathname, useRouter } from 'next/navigation'
import { API_BASE_URL, credentialsOption } from '@/services/enviroment'
import { toast } from 'sonner'
import EventNumeratedCart from '@/components/events/event-numerated-cart'
import NavTags from '@/components/events/nav-tags'

/** Colores base por orientación del estadio */
const COLORS = { E: '#2DAFCF', O: '#2DAFCF', N: '#2DAFCF', S: '#2DAFCF', default: '#2DAFCF' }

/** 
 * Ajusta el brillo de un color (más claro u oscuro según el porcentaje).
 * @param c - Color base en formato hex (#RRGGBB)
 * @param p - Porcentaje de modificación (-100 a 100)
 */
const shade = (c: string, p: number) => {
  const n = parseInt(c.slice(1), 16), a = Math.round(2.55 * p)
  const r = (n >> 16) + a, g = ((n >> 8) & 255) + a, b = (n & 255) + a
  return `#${(0x1000000 + (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
    (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
    (b < 255 ? (b < 1 ? 0 : b) : 255))
    .toString(16).slice(1)}`
}

/**
 * Componente principal que maneja la selección de butacas numeradas
 * y la reserva dentro de un estadio.
 */
export default function NumeratedHandler({ event }) {
  // 1️⃣ Obtener los IDs de los sectores visibles desde los ítems del catálogo
  const sectorIds = (event?.catalogItems ?? [])
    .filter((it: any) => it?.type === 'seats')
    .filter((it: any) => it?.visible)
    .map((it: any) => it?.sectorId)
    .filter(Boolean);

  const sectorIdSet = new Set(sectorIds);

  // 2️⃣ Recorrer stands y agregar la propiedad visible a cada sector
  const stands = (event?.stadium?.stands ?? []).map((stand: any) => ({
    ...stand,
    sectors: (stand.sectors ?? []).map((sector: any) => ({
      ...sector,
      visible: sectorIdSet.has(sector.id),
    })),
  }));

  // 3️⃣ Si querés además tener una lista "plana" de sectores visibles:

  //Es para saber el nombre de la tribuna
  const [stand, setStand] = useState(null)

  //Sector seleccionado
  const [sector, setSector] = useState(null)

  //Butacas seleccionadas
  const [seats, setSeats] = useState<string[]>([])

  const [step, setStep] = useState<number>(0)

  // Contexto global de evento (maneja datos compartidos)
  const { checkout, setCheckout } = useEventContext()
  // Navegación
  const router = useRouter()
  const url = usePathname()
  /**
   * Alterna la selección de una butaca.
   * Si ya está seleccionada, se desmarca; si no, se agrega.
   */
  const toggleSeat = (row: string, num: string) => {
    if (sector.maxPerPerson <= seats.length) {
      toast.warning("Máximo de butacas por persona alcanzado")
      return
    }
    const id = `${row}${num}`
    setSeats(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const back = () => {
    if (step == 0) {
      router.back()
    } else {
      setStep(0)
    }
  }

  /**
   * Acción del botón "Continuar":
   * 1. Valida que haya butacas seleccionadas.
   * 2. Llama al endpoint de reserva.
   * 3. Actualiza el checkout global.
   * 4. Redirige a la pantalla de pago.
   */
  const next = async () => {
    if (step == 0) {
      if (!sector) {
        toast.warning('Debes seleccionar un sector')
      } else {
        if (!sector?.numerated) {
          let item = event.catalogItems.find(c => c.sectorId === sector.sectorId);
          item.quantity = 0
          item.isSelected = false

          setCheckout({
            ...checkout,
            tickets: [item]
          })
          router.push(`${url}/checkout?type=seats&id=${item.id}`)
          return
        }
        setStep(1)
      }
    } else {
      if (!sector || seats.length === 0)
        return toast.warning('Debes seleccionar al menos una butaca')

      const item = event.catalogItems.find(c => c.sectorId === sector.sectorId);

      if (!item) return toast.error('Error al seleccionar la butaca')

      const res = await fetch(`${API_BASE_URL}/events/${event.id}/catalog/${item.id}/seats/reserve`, {
        method: 'POST',
        credentials: credentialsOption,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: seats })
      })
      const data = await res.json()

      if (data.status === 'success') {
        // Actualiza el número de entradas en el checkout
        setCheckout({
          ...checkout,
          tickets: checkout.tickets.map(p =>
            p.id === item.id ? { ...p, quantity: seats.length } : p
          ),
          selectedButacas: seats
        })
        router.push(`${url}/checkout/payment`)
      } else {
        toast.error('La butaca fue reservada')
      }
    }
  }

  /**
   * Calcula el layout dinámico del estadio en base a las tribunas disponibles.
   * Se determina el tamaño total del SVG y los márgenes según las bandejas existentes.
   */
  const layout = useMemo(() => {
    const P = 20, FW = 400, FH = 250, D = 50, G = 5, C = 40; // C = tamaño codo
    const has = (o: string, b: string) => stands.some(s => s.orientation === o && s.bandeja === b);
    const hasCodo = (o: string, t: string) => stands.some(s => s.orientation === o && s.bandeja === t);

    // Bandejas
    const top =
      P +
      (has('N', '3_bandeja') ? D + G : 0) +
      (has('N', '2_bandeja') ? D + G : 0) +
      (has('N', '1_bandeja') ? D + P : 0);

    const bottom =
      P +
      (has('S', '3_bandeja') ? D + G : 0) +
      (has('S', '2_bandeja') ? D + G : 0) +
      (has('S', '1_bandeja') ? D + P : 0);

    const left =
      P +
      (has('O', '3_bandeja') ? D + G : 0) +
      (has('O', '2_bandeja') ? D + G : 0) +
      (has('O', '1_bandeja') ? D + P : 0);

    const right =
      P +
      (has('E', '3_bandeja') ? D + G : 0) +
      (has('E', '2_bandeja') ? D + G : 0) +
      (has('E', '1_bandeja') ? D + P : 0);

    // Codos (espacio adicional)
    const codoTop = hasCodo('O', 'codo_norte') || hasCodo('E', 'codo_norte') ? C + P : 0;
    const codoBottom = hasCodo('O', 'codo_sur') || hasCodo('E', 'codo_sur') ? C + P : 0;
    const codoLeft = hasCodo('O', 'codo_norte') || hasCodo('O', 'codo_sur') ? C + P : 0;
    const codoRight = hasCodo('E', 'codo_norte') || hasCodo('E', 'codo_sur') ? C + P : 0;

    return {
      fieldX: left + codoLeft,
      fieldY: top + codoTop,
      totalWidth: left + codoLeft + FW + codoRight + right + P,
      totalHeight: top + codoTop + FH + codoBottom + bottom + P,
      FW, FH, D, G, C, P
    };
  }, [stands]);

  /**
   * Renderiza tribunas, bandejas y codos
   */
  const renderStand = (s) => {
    const { fieldX, fieldY, FW, FH, D, G, C, P } = layout;
    const base = COLORS[s.orientation] || COLORS.default;

    const is2 = s.bandeja === '2_bandeja';
    const is3 = s.bandeja === '3_bandeja';
    const isCodoN = s.bandeja === 'codo_norte';
    const isCodoS = s.bandeja === 'codo_sur';

    let x = 0, y = 0, w = 0, h = 0;
    let pathData = '';

    // === Bandejas ===
    if (s.bandeja.includes('bandeja')) {
      if (s.orientation === 'N') {
        (w = FW, h = D, x = fieldX);
        y = fieldY - P - h
          - (is2 ? G + h : 0)
          - (is3 ? (G + h) * 2 : 0);
      }

      if (s.orientation === 'S') {
        (w = FW, h = D, x = fieldX);
        y = fieldY + FH + P
          + (is2 ? G + D : 0)
          + (is3 ? (G + D) * 2 : 0);
      }

      if (s.orientation === 'O') {
        (w = D, h = FH, y = fieldY);
        x = fieldX - P - w
          - (is2 ? G + w : 0)
          - (is3 ? (G + w) * 2 : 0);
      }

      if (s.orientation === 'E') {
        (w = D, h = FH, y = fieldY);
        x = fieldX + FW + P
          + (is2 ? G + D : 0)
          + (is3 ? (G + D) * 2 : 0);
      }
    }

    // === Codos ===
// === Codos ===
if (isCodoN || isCodoS) {
  const isNorth = isCodoN;
  const cSize = C * 2; // 👈 aumenta el tamaño del codo (ajusta el multiplicador)
  const baseY = isNorth ? fieldY - P - cSize : fieldY + FH + P;
  const topY = isNorth ? fieldY - P : baseY + cSize;

  if (s.orientation === 'O') {
    const baseX = fieldX - P - cSize;
    const rightX = fieldX - P;
    pathData = `M ${baseX},${baseY} H ${rightX} V ${topY} L ${baseX},${topY} Z`;
    x = baseX;
    y = baseY;
    w = cSize;
    h = cSize;
  } else if (s.orientation === 'E') {
    const baseX = fieldX + FW + P;
    const rightX = baseX + cSize;
    pathData = `M ${baseX},${topY} H ${rightX} V ${baseY} L ${baseX},${baseY} Z`;
    x = baseX;
    y = baseY;
    w = cSize;
    h = cSize;
  }
}


    const n = s.sectors?.length || 1;

    // === Renderizado ===
    return s.sectors.map((sec, i) => {
      const sw = (s.orientation === 'N' || s.orientation === 'S') ? w / n : w;
      const sh = (s.orientation === 'N' || s.orientation === 'S') ? h : h / n;
      const sx = (s.orientation === 'N' || s.orientation === 'S') ? x + i * sw : x;
      const sy = (s.orientation === 'E' || s.orientation === 'O') ? y + i * sh : y;

      const catalog = event.catalogItems.find(c => c.sectorId === sec.id);
      const isVisible = sec.visible;
      const isSelected = sector?.sectorId === sec.id;

      const isSoldOut = catalog?.soldOut; // 👈 nuevo flag

      // --- color base ---
      const fillColor = isSoldOut
        ? '#991b1b' // rojo oscuro
        : isVisible
          ? (isSelected ? shade(base, i) : shade(base, i * 15 - 15))
          : '#4b5563';

      return (
        <g
          key={sec.id}
          onClick={(e) => {
            e.stopPropagation();
            // 👇 evita selección si está agotado o no visible
            if (isVisible && !isSoldOut) {
              setStand(s);
              setSector(catalog);
            }
          }}
          className={`cursor-${isVisible && !isSoldOut ? 'pointer' : 'not-allowed'} group`}
        >
          {s.bandeja.startsWith('codo') ? (
            <path
              d={pathData}
              fill={fillColor}
              stroke={isVisible && !isSoldOut ? 'none' : '#374151'}
              strokeWidth={isVisible && !isSoldOut ? 0 : 1.5}
            />
          ) : (
            <rect
              x={sx}
              y={sy}
              width={sw}
              height={sh}
              rx="5"
              ry="5"
              fill={fillColor}
              stroke={isVisible && !isSoldOut ? 'none' : '#374151'}
              strokeWidth={isVisible && !isSoldOut ? 0 : 1.5}
              className={
                isVisible && !isSoldOut
                  ? 'transition-all group-hover:fill-opacity-80'
                  : ''
              }
            />
          )}

          <text
            x={sx + sw / 2}
            y={sy + sh / 2}
            textAnchor="middle"
            dy=".3em"
            fill="white"
            fontSize={12}
            fontWeight="bold"
          >
            {sec.name}
          </text>
        </g>
      );
    });

  };

  useEffect(() => {
    setCheckout({ ...checkout, tickets: event.catalogItems })
  }, [])

  return (
    <section className='flex justify-center items-center w-full my-8'>
      <article className='w-full md:w-5/6 xl:w-4/5 2xl:w-3/4 flex flex-col items-center md:items-start md:flex-row gap-4'>
        <div className='w-full md:w-4/5 flex flex-col items-center'>
          <NavTags
            selectedIndex={1}
            tags={['Seleccionar ticket', 'Elegir lugar', 'Finalizar pago']}
          />
          <div className="w-full flex flex-col gap-6 text-black">
            {/* Pantalla 1: Selección de sector */}
            {
              step == 0 ? <NumeratedSelector layout={layout} stands={stands} renderStand={renderStand} /> : <Butaca selectedSeats={seats} handleSeatClick={toggleSeat}
                setSelectedSector={setSector} selectedSector={sector}
                selectedStand={stand}
                reset={() => (setStand(null), setSector(null))} />
            }
            {/* Controles de navegación */}
            <div className='w-full px-4 md:p-0 flex justify-between md:justify-end gap-4'>
              <CommonButton type='ghost' extend text='Cancelar' action={back} />
              <CommonButton type='primary' extend text='Continuar' disabled={!sector} action={next} />
            </div>
          </div>
        </div>
        <EventNumeratedCart sector={sector} seats={seats} />
      </article>
    </section>

  )
}
