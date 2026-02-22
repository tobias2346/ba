'use client'
import Image from 'next/image'
import { usePathname, useRouter } from "next/navigation";
import CommonButton from "@/components/common/common-button";
import { useState } from "react";
import { useEventContext } from '../../../context/eventContext';
import NavTags from '@/components/events/nav-tags';
const SectorizatedPlace = () => {

  const url = usePathname()
  const { event, checkout } = useEventContext()
  const router = useRouter()

  const sectorIds = (event?.catalogItems ?? [])
    .filter((it: any) => it?.type === 'ticket')
    .filter((it: any) => it?.visible)
    .map((it: any) => it?.sectorId)
    .filter(Boolean);

  const sectorIdSet = new Set(sectorIds);

  const zones = (event?.stadium?.sectors ?? []).map((sector: any) => ({
    ...sector,
    visible: sectorIdSet.has(sector.id),
  }));

  if (zones.length === 0) {
    router.back()
    return
  }

  const goBack = () => router.back()
  const [zone, setZone] = useState(false)

  const goNext = () => {
    router.push(`${url}/checkout?type=${checkout.ticketType}&zone=${zone}`)
  }

  return (
    <section className='flex justify-center items-center w-full my-8'>
      <div className='w-full md:w-2/3 2xl:w-1/2 flex flex-col items-center'>
        <NavTags
          selectedIndex={1}
          tags={['Seleccionar ticket', 'Elegir lugar', 'Finalizar pago']}
        />
        <div className="w-full md:bg-secondary rounded-lg shadow flex flex-col gap-y-2 justify-start items-start p-4 md:p-8 mb-8 h-auto">
          <h2 className="text-xl font-bold font-headline">Distribución del lugar</h2>

          {/* Imagen del estadio */}
          <div className="w-full h-96 relative">
            <Image
              src={event?.stadium?.image}
              alt="Estadio"
              className="object-cover"
              fill
            />
          </div>

          {/* Selector de zonas */}
          <h2 className="text-xl font-bold font-headline">Seleccionar sector</h2>
          {zones.map(z => (
            <button
              key={z.id}
              onClick={() => setZone(z.id)}
              disabled={!z.visible}
              className={`w-full h-20 rounded-lg shadow flex justify-center items-center font-semibold transition-colors
            ${!z.visible ? 'bg-slate-600 text-slate-400' : zone === z.id
                  ? 'bg-primary text-black'
                  : 'bg-secondary md:bg-background/80 text-light/80 hover:bg-background hover:text-light'
                }`}
            >
              {z.name}
            </button>
          ))}
       
        </div>
           <div className='w-full px-4 md:p-0'>
            <section className='w-full flex items-center justify-between md:justify-end gap-x-4'>
              <CommonButton type='ghost' extend text={'Cancelar'} action={goBack} />
              <CommonButton disabled={!zone} type='primary' extend text={'Continuar'} action={goNext} />
            </section>
          </div>
      </div>
    </section>

  )
}

export default SectorizatedPlace
