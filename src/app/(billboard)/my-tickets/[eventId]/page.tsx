
'use client'
import React, { useEffect, useState } from 'react'
import { useMyTicketContext } from './context/my-ticketsContext';
import { API_BASE_URL } from '@/services/enviroment';
import Loading from './loading';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function page() {

  const router = useRouter()
  const { event, setBatch } = useMyTicketContext()
  const [batches, setBatches] = useState([])
  const entorno = process.env.NEXT_PUBLIC_ENTORNO;

  const next = (batch) => {
    setBatch(batch)
    router.push(`/my-tickets/${event.id}/${batch.type}/${batch.batchId}`)
  }

  useEffect(() => {
    const getData = async () => {
      const res = await fetch(`${API_BASE_URL}/accesses/events/${event!.id}/batches`, {
        cache: "no-store", credentials: entorno !== "develop" ? "include" : "omit"
      });

      if (!res.ok) throw new Error("Error obteniendo los carruseles");
      const decode = await res.json();
      setBatches(decode.batches)
    }
    if (event) {
      getData()
    }
  }, [event])

  if (batches.length <= 0 || !event)
    return <Loading />

  return (
    <section className="flex-1 flex flex-col items-start p-8 md:p-20 gap-y-5">
      <button
        type='button'
        onClick={() => router.back()}
        className='text-primary flex items-center gap-x-2'
      >
        <Image src='/icons/arrow-left.svg' alt='Arrow left' width={15} height={15} />
        Volver
      </button>
      <h4 className="text-3xl font-semibold font-headline">Seleccionar tipo</h4>
      <div className='w-full flex flex-wrap gap-4'>
        {
          batches.map(batch => <button onClick={() => next(batch)} key={batch.batchId} className={` ${batch.type === 'list' ? 'bg-slate-800' : 'bg-slate-800/60'} w-96 h-28 shadow rounded-xl flex flex-col justify-around items-start p-4`}>
            <h4 className='text-2xl font-semibold'>{batch.catalogItem.name}</h4>
            <h6 className='text-sm font-semibold text-gray-300 '>{batch?.sectorName ? `Sector: ${batch?.sectorName}` : ''}</h6>
            <h6 className='text-sm font-semibold text-primary'>{batch.count} ticket adquirido</h6>
          </button>
          )
        }
      </div>
    </section>
  )
}
