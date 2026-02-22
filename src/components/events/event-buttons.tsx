'use client'
import React from 'react'
import CommonButton from '../common/common-button'
import { useRouter } from 'next/navigation'

interface EventsEventsButtonsProps {
  nextLink : string;
  disabled? : boolean;
  nextText? : string;
  prevText? : string;
}

const EventsEventsButtons = ({ nextLink, disabled, nextText, prevText } : EventsEventsButtonsProps) => {

  const router = useRouter()

  const goBack = () => router.back()

  const goNext = () => router.push(nextLink)

  return (
    <section className='w-full flex items-center justify-between md:justify-end gap-x-4'>
      <CommonButton type='ghost' extend text={prevText || 'Cancelar'} action={goBack}/>
      <CommonButton disabled={disabled} type='primary' extend text={ nextText || 'Continuar'} action={goNext}/>
    </section>
  )
}

export default EventsEventsButtons