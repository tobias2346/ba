'use client'
import React from 'react'
import CommonButton from '../common/common-button'
import { useEventContext } from '@/app/(billboard)/events/[id]/context/eventContext'
import { usePathname, useRouter } from 'next/navigation'

const EventCart = () => {

  const { event, checkout } = useEventContext()

  const router = useRouter()

  const pathName = usePathname()

  const someSelected = checkout.tickets.some(ticket => ticket.quantity > 0)

  const available = checkout.tickets.some(ticket => ticket.quantity > 0)

  const total = checkout.tickets.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const goNext = () => {
    if (available) {
      router.push(`${pathName}/payment`)
    }
  }

  return (
    <div className='w-80 2xl:w-96 flex flex-col gap-px shadow-lg'>
      <div className='w-full h-auto py-4 bg-light text-primary rounded-t-lg flex flex-col p-6 gap-y-8'>
        <h5 className='font-headline text-lg'>Resumen de pedido</h5>
        {
          someSelected ?
            <>
              <div className='w-full rounded-xl flex flex-col p-3 bg-background'>
                <h4 className='text-lg font-medium'>{event!.name}</h4>
                <h5 className='text-sm font-medium'>{event!.startDate}</h5>
              </div>
              <div className='font-medium text-secondary'>
                {
                  checkout.tickets.map(ticket => ticket.quantity > 0 &&
                    <div className='w-full flex items-center justify-between' key={ticket.id}>
                      <h4>{ticket.name} X{ticket.quantity}</h4>
                      <h4>{ticket.price * ticket.quantity}$</h4>
                    </div>
                  )
                }
              </div>
            </>
            :
            <div className='w-full rounded-xl ring-2 flex justify-center items-center py-3 text-slate-400 ring-slate-600'>Sin tickets</div>
        }
      </div>
      <div className='w-full h-auto py-4 bg-light text-primary flex justify-between items-center p-6'>
        <h4 className='text-lg'>Total</h4>
        <h5 className='font-semibold text-lg'>{total}$</h5>
      </div>
      <div className='w-full h-auto py-4 bg-light text-primary rounded-b-lg flex justify-center items-center p-6'>
        <CommonButton text='Finalizar pago' type='primary' action={goNext} extend disabled={!available} />
      </div>
    </div>
  )
}

export default EventCart